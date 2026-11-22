<script setup>
import { watch } from "vue";
import { Head, Link, usePoll } from "@inertiajs/vue3";
import AppLayout from "@/Layouts/AppLayout.vue";
import GenerationCard from "@/Components/GenerationCard.vue";

const props = defineProps({
  generations: {
    type: Array,
    required: true,
  },
});

const { start, stop } = usePoll(
  10000,
  { only: ["generations"] },
  { autoStart: false },
);

watch(
  () =>
    props.generations.some(
      ({ status }) => status === "queued" || status === "processing",
    ),
  (hasActiveGenerations) => (hasActiveGenerations ? start() : stop()),
  { immediate: true },
);
</script>

<template>
  <Head title="Your generations" />

  <AppLayout title="Your generations">
    <template #header>
      <div class="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-stone-900 p-5 sm:p-6">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600"
          >
            Pixelforge studio
          </p>
          <h1 class="mt-1 text-xl font-semibold tracking-tight text-white">
            Your generations
          </h1>
          <p class="mt-1 text-sm text-stone-300">
            A history of your images, status, and exact final charges.
          </p>
        </div>
        <Link
          :href="route('dashboard')"
          class="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <span aria-hidden="true">+</span> Create an image
        </Link>
      </div>
    </template>

    <div
      class="min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12"
    >
      <div class="mx-auto max-w-5xl">
        <div v-if="generations.length" class="space-y-4">
          <GenerationCard
            v-for="generation in generations"
            :key="generation.id"
            :generation="generation"
          />
        </div>
        <div
          v-else
          class="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center"
        >
          <div
            class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-stone-400 shadow-sm"
          >
            <svg
              class="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 5.75A1.75 1.75 0 015.75 4h12.5A1.75 1.75 0 0120 5.75v12.5A1.75 1.75 0 0118.25 20H5.75A1.75 1.75 0 014 18.25V5.75zM8 9h.01M4.5 16l4-4 3 3 3.5-4 5 5"
              />
            </svg>
          </div>
          <h2 class="mt-4 text-base font-semibold text-stone-800">
            Nothing here yet
          </h2>
          <p class="mt-1 text-sm text-stone-500">
            Create your first image to start building your gallery.
          </p>
          <Link
            :href="route('dashboard')"
            class="mt-5 inline-flex rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
            >Start creating</Link
          >
        </div>
      </div>
    </div>
  </AppLayout>
</template>
