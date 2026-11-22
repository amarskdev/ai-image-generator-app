<script setup>
import { useForm } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    daily: { type: Array, required: true },
    byUser: { type: Array, required: true },
});

const form = useForm({
    start_date: props.startDate,
    end_date: props.endDate,
});

const filter = () => form.get(route('admin.pixelforge.usage'), { preserveScroll: true });

const currency = (amount) => `$${amount}`;
</script>

<template>
    <AppLayout title="Pixelforge usage report">
        <template #header>
            <div class="rounded-2xl bg-stone-900 p-5 sm:p-6">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Operator report</p>
                <h1 class="mt-1 text-xl font-semibold tracking-tight text-white">Usage and profit</h1>
            </div>
        </template>

        <div class="min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12">
            <div class="mx-auto max-w-7xl space-y-8">
                <section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 class="text-lg font-semibold text-stone-900">Provider reconciliation</h2>
                            <p class="mt-1 max-w-2xl text-sm leading-6 text-stone-500">
                                Provider costs are loaded directly from Pixelforge’s usage API. Dates use UTC completion day.
                                A zero difference means the local per-generation costs match the provider total.
                            </p>
                        </div>
                        <form class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" @submit.prevent="filter">
                            <div>
                                <label for="start-date" class="mb-1 block text-xs font-semibold text-stone-600">From (UTC)</label>
                                <input id="start-date" v-model="form.start_date" type="date" required class="rounded-xl border-stone-200 text-sm focus:border-orange-400 focus:ring-orange-400">
                                <p v-if="form.errors.start_date" class="mt-1 text-xs text-rose-600">{{ form.errors.start_date }}</p>
                            </div>
                            <div>
                                <label for="end-date" class="mb-1 block text-xs font-semibold text-stone-600">To (UTC)</label>
                                <input id="end-date" v-model="form.end_date" type="date" required class="rounded-xl border-stone-200 text-sm focus:border-orange-400 focus:ring-orange-400">
                                <p v-if="form.errors.end_date" class="mt-1 text-xs text-rose-600">{{ form.errors.end_date }}</p>
                            </div>
                            <button type="submit" :disabled="form.processing" class="self-end rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50">
                                {{ form.processing ? 'Loading…' : 'Apply dates' }}
                            </button>
                        </form>
                    </div>
                </section>

                <section class="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                    <div class="border-b border-stone-100 px-6 py-5">
                        <h2 class="font-semibold text-stone-900">Daily totals</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full min-w-[860px] text-left text-sm">
                            <thead class="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                                <tr>
                                    <th class="px-6 py-3 font-semibold">Date (UTC)</th>
                                    <th class="px-6 py-3 text-right font-semibold">Generations</th>
                                    <th class="px-6 py-3 text-right font-semibold">Provider (API)</th>
                                    <th class="px-6 py-3 text-right font-semibold">Provider (local)</th>
                                    <th class="px-6 py-3 text-right font-semibold">Difference</th>
                                    <th class="px-6 py-3 text-right font-semibold">User charges</th>
                                    <th class="px-6 py-3 text-right font-semibold">Profit</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-stone-100">
                                <tr v-for="day in daily" :key="day.date">
                                    <td class="whitespace-nowrap px-6 py-4 font-medium text-stone-800">{{ day.date }}</td>
                                    <td class="px-6 py-4 text-right text-stone-600">{{ day.generations }}</td>
                                    <td class="px-6 py-4 text-right text-stone-600">{{ currency(day.provider_reported) }}</td>
                                    <td class="px-6 py-4 text-right text-stone-600">{{ currency(day.provider_recorded) }}</td>
                                    <td class="px-6 py-4 text-right font-medium" :class="day.reconciliation_difference_nanos === 0 ? 'text-emerald-700' : 'text-rose-700'">
                                        {{ currency(day.reconciliation_difference) }}
                                    </td>
                                    <td class="px-6 py-4 text-right text-stone-600">{{ currency(day.customer_charge) }}</td>
                                    <td class="px-6 py-4 text-right font-semibold text-stone-900">{{ currency(day.profit) }}</td>
                                </tr>
                                <tr v-if="daily.length === 0">
                                    <td colspan="7" class="px-6 py-10 text-center text-sm text-stone-500">No usage in this date range.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                    <div class="border-b border-stone-100 px-6 py-5">
                        <h2 class="font-semibold text-stone-900">Daily breakdown by user</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full min-w-[660px] text-left text-sm">
                            <thead class="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                                <tr>
                                    <th class="px-6 py-3 font-semibold">Date (UTC)</th>
                                    <th class="px-6 py-3 font-semibold">User</th>
                                    <th class="px-6 py-3 text-right font-semibold">Generations</th>
                                    <th class="px-6 py-3 text-right font-semibold">Provider cost</th>
                                    <th class="px-6 py-3 text-right font-semibold">User charges</th>
                                    <th class="px-6 py-3 text-right font-semibold">Profit</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-stone-100">
                                <tr v-for="row in byUser" :key="`${row.date}-${row.user_id}`">
                                    <td class="whitespace-nowrap px-6 py-4 text-stone-600">{{ row.date }}</td>
                                    <td class="px-6 py-4 font-medium text-stone-800">{{ row.user_name }}</td>
                                    <td class="px-6 py-4 text-right text-stone-600">{{ row.generations }}</td>
                                    <td class="px-6 py-4 text-right text-stone-600">{{ currency(row.provider_cost) }}</td>
                                    <td class="px-6 py-4 text-right text-stone-600">{{ currency(row.customer_charge) }}</td>
                                    <td class="px-6 py-4 text-right font-semibold text-stone-900">{{ currency(row.profit) }}</td>
                                </tr>
                                <tr v-if="byUser.length === 0">
                                    <td colspan="6" class="px-6 py-10 text-center text-sm text-stone-500">No completed generations in this date range.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    </AppLayout>
</template>
