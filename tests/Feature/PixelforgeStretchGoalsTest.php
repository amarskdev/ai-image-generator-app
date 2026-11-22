<?php

namespace Tests\Feature;

use App\Models\Generation;
use App\Models\GenerationCost;
use App\Models\User;
use App\Services\CreditAccountService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PixelforgeStretchGoalsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        config([
            'services.pixelforge.api_url' => 'https://pixelforge.promptedit.dev/v1',
            'services.pixelforge.api_key' => 'test-api-key',
            'services.pixelforge.webhook_secret' => 'test-webhook-secret',
            'services.pixelforge.operator_emails' => [],
            'inertia.ssr.enabled' => false,
        ]);
        Cache::flush();
        Http::preventStrayRequests();
    }

    public function test_demo_credit_purchase_updates_the_balance_and_writes_a_ledger_entry(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('credits.purchase'), ['amount' => '10'])
            ->assertRedirect()
            ->assertSessionHas('success', '$10 in demo credits was added to your balance.');

        $this->assertSame(10_000_000_000, $user->fresh()->credit_balance_nanos);
        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $user->id,
            'type' => 'credit_purchase',
            'amount_nanos' => 10_000_000_000,
            'balance_after_nanos' => 10_000_000_000,
        ]);
    }

    public function test_guests_and_unsupported_demo_credit_packages_cannot_add_credits(): void
    {
        $this->post(route('credits.purchase'), ['amount' => '5'])
            ->assertRedirect('/login');

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('credits.purchase'), ['amount' => '100'])
            ->assertSessionHasErrors('amount');

        $this->assertSame(0, $user->fresh()->credit_balance_nanos);
        $this->assertDatabaseCount('credit_transactions', 0);
    }

    public function test_generation_is_blocked_when_balance_cannot_cover_its_maximum_charge(): void
    {
        Http::fake([
            '*/pricing' => Http::response($this->pricing()),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)
            ->post(route('generations.store'), $this->generationRequest())
            ->assertRedirect()
            ->assertSessionHas('error', 'Your balance cannot cover the maximum possible charge. Buy credits and try again.');

        $this->assertDatabaseCount('generations', 0);
        $this->assertDatabaseCount('credit_transactions', 0);
        Http::assertNotSent(fn ($request): bool => $request->method() === 'POST' &&
            str_ends_with($request->url(), '/generations')
        );
    }

    public function test_successful_generation_settles_the_reserved_balance_once(): void
    {
        Http::fake([
            '*/pricing' => Http::response($this->pricing()),
            '*/generations' => Http::response($this->queuedGeneration(), 202),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);
        app(CreditAccountService::class)->purchase($user, 5_000_000_000, (string) Str::uuid());

        $this->actingAs($user)
            ->post(route('generations.store'), $this->generationRequest())
            ->assertRedirect(route('generations.index'));

        $generation = Generation::query()->sole();
        $reservedNanos = $generation->maximum_customer_charge_nanos;
        $this->assertSame(21_825_000, $reservedNanos);
        $this->assertSame(5_000_000_000 - $reservedNanos, $user->fresh()->credit_balance_nanos);

        $event = $this->successEvent($generation);
        $this->sendWebhook($event)->assertNoContent();
        $this->sendWebhook($event)->assertNoContent();

        $this->assertSame(14_006_250, $generation->fresh()->actual_customer_charge_nanos);
        $this->assertSame(5_000_000_000 - 14_006_250, $user->fresh()->credit_balance_nanos);
        $this->assertDatabaseCount('credit_transactions', 3);
        $this->assertDatabaseHas('credit_transactions', [
            'generation_id' => $generation->id,
            'type' => 'generation_settlement',
            'amount_nanos' => $reservedNanos - 14_006_250,
        ]);
    }

    public function test_failed_generation_releases_its_entire_credit_reservation(): void
    {
        Http::fake([
            '*/pricing' => Http::response($this->pricing()),
            '*/generations' => Http::response($this->queuedGeneration(), 202),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);
        app(CreditAccountService::class)->purchase($user, 5_000_000_000, (string) Str::uuid());

        $this->actingAs($user)
            ->post(route('generations.store'), $this->generationRequest())
            ->assertRedirect(route('generations.index'));

        $generation = Generation::query()->sole();
        $this->sendWebhook($this->failedEvent($generation))->assertNoContent();

        $this->assertSame(5_000_000_000, $user->fresh()->credit_balance_nanos);
        $this->assertSame(0, $generation->fresh()->actual_customer_charge_nanos);
        $this->assertDatabaseCount('credit_transactions', 3);
    }

    public function test_operator_report_reconciles_utc_costs_and_is_restricted_to_allowlisted_emails(): void
    {
        $this->freezeTime();
        $operator = User::factory()->create(['email' => 'operator@example.com']);
        $unprivileged = User::factory()->create(['email' => 'user@example.com']);
        config(['services.pixelforge.operator_emails' => ['operator@example.com']]);

        $generation = Generation::factory()->create([
            'user_id' => $unprivileged->id,
            'status' => 'succeeded',
            'completed_at' => now(),
            'actual_provider_cost_nanos' => 10,
            'actual_customer_charge_nanos' => 13,
        ]);
        GenerationCost::query()->create([
            'generation_id' => $generation->id,
            'provider_cost_nanos' => 10,
            'customer_charge_nanos' => 13,
            'currency' => 'USD',
        ]);

        $date = now('UTC')->toDateString();
        Http::fake([
            '*/usage*' => Http::response([
                'object' => 'usage',
                'start_date' => $date,
                'end_date' => $date,
                'data' => [[
                    'date' => $date,
                    'generations' => 1,
                    'input_text_tokens' => 1,
                    'input_image_tokens' => 0,
                    'output_tokens' => 1,
                    'reasoning_tokens' => 0,
                    'cost_usd' => '0.000000010',
                ]],
                'total' => ['generations' => 1, 'cost_usd' => '0.000000010'],
            ]),
        ]);

        $query = ['start_date' => $date, 'end_date' => $date];
        $this->actingAs($unprivileged)->get(route('admin.pixelforge.usage', $query))->assertForbidden();

        $this->actingAs($operator)
            ->get(route('admin.pixelforge.usage', $query))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Usage/Index')
                ->where('daily.0.provider_reported', '0.000000010')
                ->where('daily.0.provider_recorded', '0.000000010')
                ->where('daily.0.reconciliation_difference_nanos', 0)
                ->where('daily.0.customer_charge', '0.000000013')
                ->where('daily.0.profit', '0.000000003')
                ->where('byUser.0.user_name', $unprivileged->name)
                ->where('byUser.0.profit', '0.000000003'));

        Http::assertSent(fn ($request): bool => $request->method() === 'GET' &&
            str_ends_with((string) parse_url($request->url(), PHP_URL_PATH), '/usage') &&
            parse_url($request->url(), PHP_URL_QUERY) === http_build_query($query) &&
            $request->hasHeader('Authorization', 'Bearer test-api-key')
        );
    }

    public function test_operator_report_rejects_ranges_beyond_the_provider_limit(): void
    {
        config(['services.pixelforge.operator_emails' => ['operator@example.com']]);
        $operator = User::factory()->create(['email' => 'operator@example.com']);

        $this->actingAs($operator)
            ->get(route('admin.pixelforge.usage', [
                'start_date' => now('UTC')->subDays(92)->toDateString(),
                'end_date' => now('UTC')->toDateString(),
            ]))
            ->assertSessionHasErrors('end_date');

        Http::assertNothingSent();
    }

    /**
     * @return array<string, mixed>
     */
    private function generationRequest(): array
    {
        return [
            'request_id' => (string) Str::uuid(),
            'prompt' => 'test',
            'size' => '1024x1024',
            'quality' => 'low',
            'reference_images' => [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function pricing(): array
    {
        return [
            'object' => 'pricing',
            'rates' => [
                'input_text_tokens' => '5.00',
                'input_image_tokens' => '10.00',
                'output_tokens' => '40.00',
                'reasoning_tokens' => '12.50',
            ],
            'tokens' => [
                'per_reference_image' => 765,
                'characters_per_text_token' => 4,
                'text_token_variance' => 0.15,
                'output' => [
                    'low' => ['1024x1024' => 280, '1536x1024' => 420, '1024x1536' => 420],
                    'medium' => ['1024x1024' => 1100, '1536x1024' => 1650, '1024x1536' => 1650],
                    'high' => ['1024x1024' => 4300, '1536x1024' => 6450, '1024x1536' => 6450],
                ],
                'reasoning' => [
                    'low' => ['min' => 0, 'max' => 500],
                    'medium' => ['min' => 200, 'max' => 2000],
                    'high' => ['min' => 1000, 'max' => 8000],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function queuedGeneration(): array
    {
        return [
            'id' => 'gen_stretch_123',
            'object' => 'generation',
            'status' => 'queued',
            'rates' => $this->pricing()['rates'],
            'metadata' => [],
            'created_at' => now()->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function successEvent(Generation $generation): array
    {
        return [
            'id' => 'evt_stretch_success',
            'object' => 'event',
            'type' => 'generation.succeeded',
            'created_at' => now()->toIso8601String(),
            'data' => [
                'object' => [
                    ...$this->queuedGeneration(),
                    'status' => 'succeeded',
                    'usage' => [
                        'input_text_tokens' => 1,
                        'input_image_tokens' => 0,
                        'output_tokens' => 280,
                        'reasoning_tokens' => 0,
                        'total_tokens' => 281,
                    ],
                    'image_url' => 'https://pixelforge.promptedit.dev/images/gen_stretch_123.png',
                    'completed_at' => now()->toIso8601String(),
                    'metadata' => ['application_generation_id' => $generation->id],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function failedEvent(Generation $generation): array
    {
        return [
            'id' => 'evt_stretch_failed',
            'object' => 'event',
            'type' => 'generation.failed',
            'created_at' => now()->toIso8601String(),
            'data' => [
                'object' => [
                    ...$this->queuedGeneration(),
                    'status' => 'failed',
                    'error' => ['code' => 'generation_failed', 'message' => 'No charge was made.'],
                    'completed_at' => now()->toIso8601String(),
                    'metadata' => ['application_generation_id' => $generation->id],
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $event
     */
    private function sendWebhook(array $event): TestResponse
    {
        $body = json_encode($event, JSON_THROW_ON_ERROR);
        $timestamp = (string) now()->timestamp;
        $signature = 't='.$timestamp.',v1='.hash_hmac(
            'sha256',
            $timestamp.'.'.$body,
            'test-webhook-secret',
        );

        return $this->call('POST', '/api/pixelforge/webhooks', [], [], [], [
            'CONTENT_LENGTH' => mb_strlen($body, '8bit'),
            'CONTENT_TYPE' => 'application/json',
            'HTTP_PIXELFORGE_EVENT_ID' => $event['id'],
            'HTTP_PIXELFORGE_EVENT_TYPE' => $event['type'],
            'HTTP_PIXELFORGE_SIGNATURE' => $signature,
        ], $body);
    }
}
