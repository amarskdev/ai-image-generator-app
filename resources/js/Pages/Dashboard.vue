<script setup>
import { computed, ref, watch } from 'vue';
import { Head, Link, useForm, usePoll } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import GenerationCard from '@/Components/GenerationCard.vue';

const props = defineProps({
    pricing: {
        type: Object,
        required: true,
    },
    requestId: {
        type: String,
        required: true,
    },
    generations: {
        type: Array,
        required: true,
    },
    credits: {
        type: Object,
        required: true,
    },
});

const form = useForm({
    request_id: props.requestId,
    prompt: '',
    size: '1024x1024',
    quality: 'medium',
    reference_images: [''],
});
const purchaseForm = useForm({ amount: '5' });

const { start, stop } = usePoll(10000, { only: ['generations'] }, { autoStart: false });

watch(
    () => props.generations.some(({ status }) => status === 'queued' || status === 'processing'),
    (hasActiveGenerations) => hasActiveGenerations ? start() : stop(),
    { immediate: true },
);

const parseUsdNanos = (amount) => {
    const [dollars, decimals = ''] = String(amount).split('.');

    return BigInt(dollars) * 1_000_000_000n + BigInt(decimals.padEnd(9, '0').slice(0, 9));
};

const formatNanos = (amount) => {
    const dollars = amount / 1_000_000_000n;
    const nanos = String(amount % 1_000_000_000n).padStart(9, '0');
    const decimals = nanos.replace(/0+$/, '').padEnd(4, '0');

    return `$${dollars}.${decimals}`;
};

const estimate = computed(() => {
    if (!form.prompt.trim()) return null;

    const rates = props.pricing.rates;
    const tokenPrices = Object.fromEntries(
        Object.entries(rates).map(([key, value]) => [key, parseUsdNanos(value) / 1_000_000n]),
    );
    const charactersPerTextToken = props.pricing.tokens.characters_per_text_token ?? 4;
    const reasoning = props.pricing.tokens.reasoning[form.quality];
    const promptTokenEstimate = Math.ceil([...form.prompt].length / charactersPerTextToken);
    const usage = {
        input_text_tokens: promptTokenEstimate,
        input_image_tokens: form.reference_images.filter((url) => url.trim()).length * props.pricing.tokens.per_reference_image,
        output_tokens: props.pricing.tokens.output[form.quality][form.size],
        reasoning_tokens: Math.floor((reasoning.min + reasoning.max) / 2),
    };

    const providerCost = (tokenUsage) => Object.entries(tokenUsage).reduce(
        (total, [key, count]) => total + BigInt(count) * tokenPrices[key],
        0n,
    );
    const providerNanos = providerCost(usage);
    const customerNanos = (providerNanos * 5n + 2n) / 4n;
    const maximumProviderNanos = providerCost({
        ...usage,
        input_text_tokens: Math.ceil(promptTokenEstimate * (1 + (props.pricing.tokens.text_token_variance ?? 0.15))),
        reasoning_tokens: reasoning.max,
    });
    const maximumCustomerNanos = (maximumProviderNanos * 5n + 2n) / 4n;

    return {
        provider: formatNanos(providerNanos),
        customer: formatNanos(customerNanos),
        maximumCustomer: formatNanos(maximumCustomerNanos),
        maximumCustomerNanos,
    };
});

const canAffordMaximum = computed(() => estimate.value !== null &&
    parseUsdNanos(props.credits.balance) >= estimate.value.maximumCustomerNanos);

const addReferenceImage = () => {
    if (form.reference_images.length < 4) form.reference_images.push('');
};

const removeReferenceImage = (index) => {
    form.reference_images.splice(index, 1);
};

const submit = () => {
    if (!canAffordMaximum.value) return;

    form.reference_images = form.reference_images.filter((url) => url.trim() !== '');
    form.post(route('generations.store'), {
        preserveScroll: true,
        onSuccess: () => {
            form.reset('prompt', 'reference_images');
            form.request_id = globalThis.crypto.randomUUID();
        },
    });
};

const buyCredits = () => {
    purchaseForm.post(route('credits.purchase'), {
        preserveScroll: true,
    });
};
</script>

<template>
    <Head title="Create an image" />

    <AppLayout title="Create">
        <template #header>
            <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-stone-900 p-5 sm:p-6">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Pixelforge studio</p>
                    <h1 class="mt-1 text-xl font-semibold tracking-tight text-white">Create an image</h1>
                </div>
                <Link :href="route('generations.index')" class="text-sm font-semibold text-stone-300 transition hover:text-white">
                    View history <span aria-hidden="true">→</span>
                </Link>
            </div>
        </template>

        <div class="min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12">
            <div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
                <div class="space-y-6">
                    <section class="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Available credits</p>
                                <p class="mt-1 text-2xl font-semibold tracking-tight text-stone-900">${{ credits.balance }}</p>
                                <p class="mt-1 text-xs text-stone-500">Demo credits only — no real payment is taken.</p>
                            </div>
                            <form class="flex flex-wrap items-center gap-2" @submit.prevent="buyCredits">
                                <label for="credit-amount" class="sr-only">Credit amount</label>
                                <select
                                    id="credit-amount"
                                    v-model="purchaseForm.amount"
                                    class="rounded-xl border-stone-200 bg-white py-2.5 text-sm text-stone-800 focus:border-orange-400 focus:ring-orange-400"
                                >
                                    <option v-for="amount in credits.purchaseOptions" :key="amount" :value="amount">${{ amount }} demo credits</option>
                                </select>
                                <button
                                    type="submit"
                                    :disabled="purchaseForm.processing"
                                    class="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {{ purchaseForm.processing ? 'Adding…' : 'Buy credits' }}
                                </button>
                            </form>
                        </div>
                    </section>

                    <section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                    <div class="mb-8">
                        <div class="flex size-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
                            </svg>
                        </div>
                        <h2 class="mt-5 text-2xl font-semibold tracking-tight text-stone-900">Give your idea a canvas.</h2>
                        <p class="mt-2 max-w-lg text-sm leading-6 text-stone-500">Describe what you imagine, choose a format, and we’ll take it from there.</p>
                    </div>

                    <form class="space-y-6" @submit.prevent="submit">
                        <div>
                            <label for="prompt" class="mb-2 block text-sm font-semibold text-stone-800">Your prompt</label>
                            <textarea
                                id="prompt"
                                v-model="form.prompt"
                                rows="5"
                                maxlength="4000"
                                required
                                placeholder="A tiny glass greenhouse on a rainy rooftop at dusk, cinematic light..."
                                class="w-full resize-y rounded-xl border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-900 placeholder:text-stone-400 focus:border-orange-400 focus:bg-white focus:ring-orange-400"
                            />
                            <div class="mt-2 flex justify-between text-xs text-stone-400">
                                <span v-if="form.errors.prompt" class="text-rose-600">{{ form.errors.prompt }}</span>
                                <span v-else>Be as specific as you like.</span>
                                <span>{{ [...form.prompt].length }} / 4,000</span>
                            </div>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label for="size" class="mb-2 block text-sm font-semibold text-stone-800">Canvas size</label>
                                <select id="size" v-model="form.size" class="w-full rounded-xl border-stone-200 bg-white py-3 text-sm text-stone-800 focus:border-orange-400 focus:ring-orange-400">
                                    <option value="1024x1024">Square · 1024 × 1024</option>
                                    <option value="1536x1024">Landscape · 1536 × 1024</option>
                                    <option value="1024x1536">Portrait · 1024 × 1536</option>
                                </select>
                            </div>
                            <div>
                                <label for="quality" class="mb-2 block text-sm font-semibold text-stone-800">Quality</label>
                                <select id="quality" v-model="form.quality" class="w-full rounded-xl border-stone-200 bg-white py-3 text-sm capitalize text-stone-800 focus:border-orange-400 focus:ring-orange-400">
                                    <option value="low">Low · quick draft</option>
                                    <option value="medium">Medium · balanced</option>
                                    <option value="high">High · fine detail</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <label class="block text-sm font-semibold text-stone-800">Reference images <span class="font-normal text-stone-400">· optional</span></label>
                                <button v-if="form.reference_images.length < 4" type="button" class="text-xs font-semibold text-orange-700 hover:text-orange-800" @click="addReferenceImage">
                                    + Add URL
                                </button>
                            </div>
                            <div class="space-y-2">
                                <div v-for="(url, index) in form.reference_images" :key="index" class="flex gap-2">
                                    <input
                                        v-model="form.reference_images[index]"
                                        type="url"
                                        placeholder="https://example.com/image.png"
                                        class="min-w-0 flex-1 rounded-xl border-stone-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:ring-orange-400"
                                    >
                                    <button v-if="form.reference_images.length > 1" type="button" class="rounded-xl px-3 text-stone-400 hover:bg-stone-100 hover:text-stone-700" :aria-label="`Remove reference image ${index + 1}`" @click="removeReferenceImage(index)">
                                        ×
                                    </button>
                                </div>
                            </div>
                            <p v-if="form.errors.reference_images || form.errors['reference_images.0']" class="mt-2 text-xs text-rose-600">
                                {{ form.errors.reference_images || form.errors['reference_images.0'] }}
                            </p>
                            <p v-else class="mt-2 text-xs text-stone-400">Add up to four publicly accessible image URLs.</p>
                        </div>

                        <div class="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                            <div class="flex items-start justify-between gap-5">
                                <div>
                                    <p class="text-sm font-semibold text-stone-800">Estimated cost</p>
                                    <p class="mt-1 text-xs leading-5 text-stone-500">Pixelforge usage plus a 25% service markup.</p>
                                </div>
                                <div v-if="estimate" class="text-right">
                                    <p class="text-xl font-semibold tracking-tight text-stone-900">{{ estimate.customer }}</p>
                                    <p class="mt-1 text-xs text-stone-500">provider {{ estimate.provider }}</p>
                                </div>
                                <p v-else class="text-sm font-medium text-stone-400">Add a prompt to estimate</p>
                            </div>
                            <p class="mt-3 border-t border-orange-100 pt-3 text-[11px] leading-5 text-stone-500">
                                Estimate uses average text and reasoning tokens. Final cost is calculated from exact usage; failed generations are free.
                            </p>
                            <p v-if="estimate" class="mt-2 text-xs leading-5 text-stone-600">
                                Up to {{ estimate.maximumCustomer }} may be held while the image is processing; unused credits are released when it finishes.
                            </p>
                            <p v-if="estimate && !canAffordMaximum" class="mt-2 text-xs font-medium text-rose-700">
                                Your balance is too low to cover this generation's maximum possible charge. Buy credits to continue.
                            </p>
                        </div>

                        <button
                            type="submit"
                            :disabled="form.processing || !form.prompt.trim() || !canAffordMaximum"
                            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <svg v-if="form.processing" class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                            </svg>
                            {{ form.processing ? 'Sending to Pixelforge…' : 'Generate image' }}
                        </button>
                    </form>
                    </section>
                </div>

                <section class="space-y-5">
                    <div class="flex items-end justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Your workspace</p>
                            <h2 class="mt-1 text-lg font-semibold text-stone-900">Recent generations</h2>
                        </div>
                        <Link :href="route('generations.index')" class="text-xs font-semibold text-orange-700 hover:text-orange-800">See all</Link>
                    </div>

                    <div v-if="generations.length" class="space-y-4">
                        <GenerationCard v-for="generation in generations" :key="generation.id" :generation="generation" />
                    </div>
                    <div v-else class="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center">
                        <div class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-stone-400 shadow-sm">
                            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 5.75A1.75 1.75 0 015.75 4h12.5A1.75 1.75 0 0120 5.75v12.5A1.75 1.75 0 0118.25 20H5.75A1.75 1.75 0 014 18.25V5.75zM8 9h.01M4.5 16l4-4 3 3 3.5-4 5 5" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-sm font-semibold text-stone-800">Your canvas is ready</h3>
                        <p class="mt-1 text-sm text-stone-500">Your first image will appear here.</p>
                    </div>
                </section>
            </div>
        </div>
    </AppLayout>
</template>
