<script setup>
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    canLogin: {
        type: Boolean,
    },
    canRegister: {
        type: Boolean,
    },
});
</script>

<template>
    <Head title="Imagine it. Make it." />

    <div class="min-h-screen overflow-hidden bg-[#f7f6f3] text-stone-900">
        <header class="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
            <div class="flex items-center gap-3">
                <svg class="size-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect width="40" height="40" rx="12" fill="#171717" />
                    <path d="M12 12h16v16H12z" fill="#FA714B" />
                    <path d="M18 18h10v10H18z" fill="#FDBA74" />
                    <path d="M12 12h6v6h-6z" fill="#FFF7ED" />
                </svg>
                <span class="text-base font-semibold tracking-tight">PixelForge</span>
            </div>
            <nav v-if="canLogin" class="flex items-center gap-3">
                <Link
                    v-if="$page.props.auth.user"
                    :href="route('dashboard')"
                    class="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
                >
                    Open studio
                </Link>
                <template v-else>
                    <Link :href="route('login')" class="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white">
                        Sign in
                    </Link>
                    <Link
                        v-if="canRegister"
                        :href="route('register')"
                        class="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
                    >
                        Create account
                    </Link>
                </template>
            </nav>
        </header>

        <main class="relative mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-16">
            <div class="pointer-events-none absolute -right-52 top-8 size-[34rem] rounded-full bg-orange-200/50 blur-3xl" />
            <div class="pointer-events-none absolute -left-48 top-72 size-96 rounded-full bg-amber-100/70 blur-3xl" />

            <div class="relative grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
                <section class="max-w-2xl">
                    <div class="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-orange-800">
                        <span class="size-1.5 rounded-full bg-orange-500" />
                        Your ideas, rendered
                    </div>
                    <h1 class="mt-7 text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-stone-950 sm:text-6xl lg:text-7xl">
                        Make room for
                        <span class="block text-orange-600">the unexpected.</span>
                    </h1>
                    <p class="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                        Turn a thought into an image. Shape the canvas, dial in the detail, and keep every generation and its exact cost in one place.
                    </p>
                    <div class="mt-9 flex flex-wrap items-center gap-3">
                        <Link
                            v-if="canRegister && !$page.props.auth.user"
                            :href="route('register')"
                            class="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-stone-900/10 transition hover:-translate-y-0.5 hover:bg-stone-800"
                        >
                            Start creating <span aria-hidden="true">→</span>
                        </Link>
                        <Link
                            v-else
                            :href="route('dashboard')"
                            class="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-stone-900/10 transition hover:-translate-y-0.5 hover:bg-stone-800"
                        >
                            Open the studio <span aria-hidden="true">→</span>
                        </Link>
                        <span class="px-2 text-sm text-stone-500">Clear estimates. No charge for failed images.</span>
                    </div>

                    <div class="mt-14 grid max-w-lg grid-cols-3 gap-5 border-t border-stone-200 pt-6">
                        <div>
                            <p class="text-xl font-semibold tracking-tight">3 sizes</p>
                            <p class="mt-1 text-xs text-stone-500">Square to portrait</p>
                        </div>
                        <div>
                            <p class="text-xl font-semibold tracking-tight">Exact costs</p>
                            <p class="mt-1 text-xs text-stone-500">Usage based, never guessed</p>
                        </div>
                        <div>
                            <p class="text-xl font-semibold tracking-tight">Your history</p>
                            <p class="mt-1 text-xs text-stone-500">Every image, one view</p>
                        </div>
                    </div>
                </section>

                <section class="relative mx-auto w-full max-w-xl">
                    <div class="absolute -inset-4 rotate-[-4deg] rounded-[2rem] bg-orange-200/70" />
                    <div class="relative overflow-hidden rounded-[1.7rem] border border-stone-200 bg-white p-3 shadow-2xl shadow-stone-900/10">
                        <div class="relative aspect-[4/4.15] overflow-hidden rounded-[1.2rem] bg-gradient-to-br from-[#d7d0c0] via-[#f2b88e] to-[#9b6951]">
                            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_45%,rgba(255,244,218,0.8),transparent_35%),linear-gradient(180deg,transparent_45%,rgba(54,39,34,0.62))]" />
                            <div class="absolute left-[12%] top-[15%] h-[55%] w-[75%] rotate-[-8deg] rounded-[45%] border border-white/40 bg-white/10 blur-[1px]" />
                            <div class="absolute bottom-[13%] left-[12%] right-[12%]">
                                <span class="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md">A moment, imagined</span>
                                <p class="mt-4 max-w-sm text-2xl font-medium leading-tight tracking-tight text-white sm:text-3xl">A quiet place between the real and the possible.</p>
                            </div>
                            <div class="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur">
                                <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
                                </svg>
                            </div>
                        </div>
                        <div class="flex items-center justify-between px-2 py-4">
                            <div>
                                <p class="text-sm font-semibold text-stone-800">Made from a few words</p>
                                <p class="mt-1 text-xs text-stone-500">Create · refine · keep</p>
                            </div>
                            <div class="flex -space-x-2">
                                <span class="size-7 rounded-full border-2 border-white bg-orange-300" />
                                <span class="size-7 rounded-full border-2 border-white bg-stone-300" />
                                <span class="size-7 rounded-full border-2 border-white bg-amber-200" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>
</template>
