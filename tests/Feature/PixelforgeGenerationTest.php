<?php

namespace Tests\Feature;

use App\Models\Generation;
use App\Models\GenerationCost;
use App\Models\GenerationEvent;
use App\Models\User;
use App\Services\CreditAccountService;
use App\Services\GenerationStateUpdater;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PixelforgeGenerationTest extends TestCase
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
            'inertia.ssr.enabled' => false,
        ]);

        Cache::flush();
        Http::preventStrayRequests();
    }

    public function test_guests_cannot_create_or_view_generations(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/generations')->assertRedirect('/login');
        $this->post('/generations', $this->validRequest())->assertRedirect('/login');
    }

    public function test_dashboard_loads_live_pricing_for_the_generation_estimate(): void
    {
        Http::fake([
            '*/pricing' => Http::response($this->pricing()),
        ]);

        $user = $this->createFundedUser();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->where('pricing.rates.output_tokens', '40.00')
                ->has('pricing.tokens.output.medium')
                ->where('requestId', fn ($requestId): bool => is_string($requestId))
                ->has('generations', 0));
    }

    public function test_generation_submission_uses_the_provider_and_stores_an_exact_estimate(): void
    {
        Http::fake([
            '*/pricing' => Http::response($this->pricing()),
            '*/generations' => Http::response($this->queuedProviderGeneration(), 202),
        ]);

        $user = $this->createFundedUser();

        $this->actingAs($user)
            ->post('/generations', $this->validRequest())
            ->assertRedirect(route('generations.index'));

        $generation = Generation::query()->sole();

        $this->assertSame($user->id, $generation->user_id);
        $this->assertSame('gen_test_123', $generation->provider_generation_id);
        $this->assertSame('queued', $generation->status);
        $this->assertSame(57_755_000, $generation->estimated_provider_cost_nanos);
        $this->assertSame(72_193_750, $generation->estimated_customer_charge_nanos);

        Http::assertSent(fn ($request): bool => $request->url() === 'https://pixelforge.promptedit.dev/v1/generations' &&
            $request->hasHeader('Authorization', 'Bearer test-api-key') &&
            $request->hasHeader('Idempotency-Key', $generation->idempotency_key) &&
            $request['metadata']['application_generation_id'] === $generation->id
        );
    }

    public function test_duplicate_browser_submissions_reuse_the_existing_generation(): void
    {
        Http::fake([
            '*/pricing' => Http::response($this->pricing()),
            '*/generations' => Http::response($this->queuedProviderGeneration(), 202),
        ]);

        $user = $this->createFundedUser();
        $request = $this->validRequest();

        $this->actingAs($user)->post('/generations', $request)->assertRedirect(route('generations.index'));
        $this->post('/generations', $request)->assertRedirect(route('generations.index'));

        $this->assertSame(1, Generation::query()->count());
        Http::assertSentCount(2);
    }

    public function test_a_request_token_cannot_be_reused_for_different_generation_parameters(): void
    {
        Http::fake([
            '*/pricing' => Http::response($this->pricing()),
            '*/generations' => Http::response($this->queuedProviderGeneration(), 202),
        ]);

        $user = $this->createFundedUser();
        $request = $this->validRequest();

        $this->actingAs($user)->post('/generations', $request)->assertRedirect(route('generations.index'));
        $request['prompt'] = 'A different prompt';

        $this->post('/generations', $request)->assertConflict();

        $this->assertSame(1, Generation::query()->count());
        Http::assertSentCount(2);
    }

    public function test_duplicate_and_out_of_order_webhooks_record_a_successful_charge_once(): void
    {
        $user = User::factory()->create();
        $generation = Generation::factory()->create([
            'user_id' => $user->id,
            'provider_rates' => $this->pricing()['rates'],
        ]);

        $successEvent = $this->event(
            'evt_success',
            'generation.succeeded',
            $this->succeededProviderGeneration($generation->id),
        );

        $successResponse = $this->sendWebhook($successEvent);
        $successResponse->assertNoContent();
        app(GenerationStateUpdater::class)->apply($generation, $this->queuedProviderGeneration());
        $this->sendWebhook($successEvent)->assertNoContent();

        $this->sendWebhook($this->event(
            'evt_processing',
            'generation.processing',
            [...$this->queuedProviderGeneration(), 'id' => 'gen_test_123', 'status' => 'processing'],
        ))->assertNoContent();

        $generation->refresh();

        $this->assertSame('succeeded', $generation->status);
        $this->assertSame(305_510_000, $generation->actual_provider_cost_nanos);
        $this->assertSame(381_887_500, $generation->actual_customer_charge_nanos);
        $this->assertSame(2, GenerationEvent::query()->count());
        $this->assertSame(1, GenerationCost::query()->count());
    }

    public function test_webhook_signatures_are_checked_against_the_raw_body(): void
    {
        $event = $this->event('evt_bad_signature', 'ping', null);

        $response = $this->sendWebhook($event, 't='.now()->timestamp.',v1='.str_repeat('0', 64));

        $response->assertBadRequest();
        $timestamp = (string) now()->subSeconds(301)->timestamp;
        $body = json_encode($event, JSON_THROW_ON_ERROR);
        $staleSignature = 't='.$timestamp.',v1='.hash_hmac(
            'sha256',
            $timestamp.'.'.$body,
            'test-webhook-secret',
        );

        $this->sendWebhook($event, $staleSignature)->assertBadRequest();
        $this->assertDatabaseCount('generation_events', 0);
    }

    public function test_polling_reconciles_an_active_generation_from_pixelforge(): void
    {
        Http::fake([
            '*/generations/gen_test_123' => Http::response($this->succeededProviderGeneration(), 200),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);
        $generation = Generation::factory()->create([
            'user_id' => $user->id,
            'provider_generation_id' => 'gen_test_123',
            'provider_rates' => $this->pricing()['rates'],
        ]);

        $this->actingAs($user)->get('/generations')->assertOk();

        $this->assertSame('succeeded', $generation->fresh()->status);
        $this->assertSame(305_510_000, $generation->fresh()->actual_provider_cost_nanos);
        $this->assertDatabaseCount('generation_costs', 1);
        Http::assertSent(fn ($request): bool => $request->method() === 'GET' &&
            $request->url() === 'https://pixelforge.promptedit.dev/v1/generations/gen_test_123'
        );
    }

    public function test_a_temporary_provider_rejection_can_be_retried_with_the_same_idempotency_key(): void
    {
        $postCount = 0;
        $idempotencyKeys = [];

        Http::fake(function ($request) use (&$postCount, &$idempotencyKeys) {
            if (str_ends_with($request->url(), '/pricing')) {
                return Http::response($this->pricing());
            }

            if ($request->method() === 'POST') {
                $idempotencyKeys[] = $request->header('Idempotency-Key')[0];
                $postCount++;

                if ($postCount === 1) {
                    return Http::response([
                        'error' => [
                            'code' => 'overloaded',
                            'message' => 'Pixelforge is temporarily overloaded.',
                        ],
                    ], 503, ['Retry-After' => '2']);
                }

                return Http::response($this->queuedProviderGeneration(), 202);
            }

            return Http::response([], 404);
        });

        $user = $this->createFundedUser();
        $this->actingAs($user)->post('/generations', $this->validRequest())->assertRedirect(route('generations.index'));

        $generation = Generation::query()->sole();
        $this->assertSame('failed', $generation->status);
        $this->assertSame('overloaded', $generation->provider_error_code);
        $this->assertSame(0, $generation->actual_customer_charge_nanos);

        $this->post(route('generations.retry', $generation))->assertRedirect();
        $this->travel(3)->seconds();
        $this->post(route('generations.retry', $generation))->assertRedirect(route('generations.index'));

        $this->assertSame('queued', $generation->fresh()->status);
        $this->assertCount(2, $idempotencyKeys);
        $this->assertSame($idempotencyKeys[0], $idempotencyKeys[1]);
    }

    public function test_failed_generations_are_free_and_owned_history_is_private(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $otherUser = User::factory()->create();
        $owned = Generation::factory()->create([
            'user_id' => $owner->id,
            'provider_generation_id' => 'gen_test_123',
        ]);
        $notOwned = Generation::factory()->create(['user_id' => $otherUser->id]);

        $this->sendWebhook($this->event(
            'evt_failed',
            'generation.failed',
            [
                ...$this->queuedProviderGeneration(),
                'id' => 'gen_test_123',
                'status' => 'failed',
                'error' => ['code' => 'generation_failed', 'message' => 'No charge was made.'],
                'completed_at' => now()->toIso8601String(),
            ],
        ))->assertNoContent();

        $this->actingAs($owner)
            ->get('/generations')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Generations/Index')
                ->has('generations', 1)
                ->where('generations.0.id', $owned->id));

        $this->assertSame('failed', $owned->fresh()->status);
        $this->assertSame(0, $owned->fresh()->actual_provider_cost_nanos);
        $this->assertSame(0, $owned->fresh()->actual_customer_charge_nanos);
        $this->assertSame('queued', $notOwned->fresh()->status);
        $this->assertDatabaseCount('generation_costs', 0);
    }

    /**
     * @return array<string, mixed>
     */
    private function validRequest(): array
    {
        return [
            'request_id' => '11111111-1111-4111-8111-111111111111',
            'prompt' => 'test',
            'size' => '1024x1024',
            'quality' => 'medium',
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
                'characters_per_text_token' => 4,
                'text_token_variance' => 0.15,
            ],
        ];
    }

    private function createFundedUser(): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        app(CreditAccountService::class)->purchase($user, 5_000_000_000, (string) Str::uuid());

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    private function queuedProviderGeneration(): array
    {
        return [
            'id' => 'gen_test_123',
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
    private function succeededProviderGeneration(?string $localGenerationId = null): array
    {
        return [
            ...$this->queuedProviderGeneration(),
            'status' => 'succeeded',
            'usage' => [
                'input_text_tokens' => 12,
                'input_image_tokens' => 765,
                'output_tokens' => 6450,
                'reasoning_tokens' => 3184,
                'total_tokens' => 10411,
            ],
            'image_url' => 'https://pixelforge.promptedit.dev/images/gen_test_123.png',
            'completed_at' => now()->toIso8601String(),
            'metadata' => $localGenerationId === null
                ? []
                : ['application_generation_id' => $localGenerationId],
        ];
    }

    /**
     * @param  array<string, mixed>|null  $providerGeneration
     * @return array<string, mixed>
     */
    private function event(string $id, string $type, ?array $providerGeneration): array
    {
        $event = [
            'id' => $id,
            'object' => 'event',
            'type' => $type,
            'created_at' => now()->toIso8601String(),
        ];

        if ($providerGeneration !== null) {
            $event['data'] = ['object' => $providerGeneration];
        }

        return $event;
    }

    /**
     * @param  array<string, mixed>  $event
     */
    private function sendWebhook(array $event, ?string $signature = null): TestResponse
    {
        $body = json_encode($event, JSON_THROW_ON_ERROR);
        $timestamp = (string) now()->timestamp;
        $signature ??= 't='.$timestamp.',v1='.hash_hmac(
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
