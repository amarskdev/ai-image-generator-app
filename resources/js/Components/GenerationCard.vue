<script setup>
import { router } from '@inertiajs/vue3';

defineProps({
    generation: {
        type: Object,
        required: true,
    },
});

const statusClass = (status) => ({
    queued: 'bg-amber-50 text-amber-700 ring-amber-200',
    processing: 'bg-sky-50 text-sky-700 ring-sky-200',
    succeeded: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    failed: 'bg-rose-50 text-rose-700 ring-rose-200',
}[status] ?? 'bg-stone-100 text-stone-600 ring-stone-200');

const formatMoney = (value) => {
    if (value === null || value === undefined) return null;

    const [dollars, decimals = ''] = String(value).split('.');
    const normalizedDecimals = decimals.replace(/0+$/, '').padEnd(4, '0');

    return `$${dollars}.${normalizedDecimals}`;
};

const retry = (id) => {
    router.post(route('generations.retry', id), {}, { preserveScroll: true });
};
</script>

<template>
    <article class="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300 hover:shadow-md">
        <div class="grid md:grid-cols-[220px_1fr]">
            <div class="relative aspect-square bg-stone-100 md:aspect-auto">
                <img
                    v-if="generation.image_url"
                    :src="generation.image_url"
                    :alt="generation.prompt"
                    class="h-full min-h-48 w-full object-cover"
                >
                <div v-else class="flex h-full min-h-48 items-center justify-center p-8 text-center">
                    <div>
                        <div class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                            <svg v-if="generation.status === 'processing' || generation.status === 'queued'" class="size-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                            </svg>
                            <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16.5l5-5 3.5 3.5L20 7.5M14.5 7.5H20V13" />
                            </svg>
                        </div>
                        <p class="mt-3 text-xs font-medium text-stone-500">
                            {{ generation.status === 'failed' ? 'No image was created' : 'Your image is taking shape' }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex min-w-0 flex-col justify-between p-5 sm:p-6">
                <div>
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <span class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset" :class="statusClass(generation.status)">
                            <span class="size-1.5 rounded-full bg-current" />
                            {{ generation.status }}
                        </span>
                        <span class="text-xs text-stone-400">{{ generation.quality }} · {{ generation.size }}</span>
                    </div>
                    <p class="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-stone-800">{{ generation.prompt }}</p>
                    <p v-if="generation.provider_error_message" class="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {{ generation.provider_error_message }}
                    </p>
                </div>

                <div class="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-stone-100 pt-4">
                    <div class="flex gap-7">
                        <div>
                            <p class="text-[11px] font-medium uppercase tracking-wide text-stone-400">Estimated</p>
                            <p class="mt-1 text-sm font-semibold text-stone-700">{{ formatMoney(generation.estimated_customer_charge) }}</p>
                        </div>
                        <div>
                            <p class="text-[11px] font-medium uppercase tracking-wide text-stone-400">
                                {{ generation.status === 'failed' ? 'Charged' : 'Actual charge' }}
                            </p>
                            <p class="mt-1 text-sm font-semibold" :class="generation.actual_customer_charge === '0.000000000' ? 'text-emerald-700' : 'text-stone-700'">
                                {{ generation.actual_customer_charge === null ? '—' : formatMoney(generation.actual_customer_charge) }}
                            </p>
                        </div>
                    </div>
                    <button
                        v-if="generation.can_retry"
                        type="button"
                        class="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-orange-300 hover:text-orange-700"
                        @click="retry(generation.id)"
                    >
                        Retry safely
                    </button>
                </div>
            </div>
        </div>
    </article>
</template>
