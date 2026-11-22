import { t as _sfc_main$1 } from "./AppLayout-Czt4fV3t.js";
import { t as _sfc_main$2 } from "./GenerationCard-Ce2VKILM.js";
import { Fragment, createBlock, createTextVNode, createVNode, openBlock, renderList, unref, useSSRContext, watch, withCtx } from "vue";
import { Head, Link, usePoll } from "@inertiajs/vue3";
import { ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
// resources/js/Pages/Generations/Index.vue
var _sfc_main = {
	__name: "Index",
	__ssrInlineRender: true,
	props: { generations: {
		type: Array,
		required: true
	} },
	setup(__props) {
		const props = __props;
		const { start, stop } = usePoll(1e4, { only: ["generations"] }, { autoStart: false });
		watch(() => props.generations.some(({ status }) => status === "queued" || status === "processing"), (hasActiveGenerations) => hasActiveGenerations ? start() : stop(), { immediate: true });
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: "Your generations" }, null, _parent));
			_push(ssrRenderComponent(_sfc_main$1, { title: "Your generations" }, {
				header: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-stone-900 p-5 sm:p-6"${_scopeId}><div${_scopeId}><p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600"${_scopeId}> Pixelforge studio </p><h1 class="mt-1 text-xl font-semibold tracking-tight text-white"${_scopeId}> Your generations </h1><p class="mt-1 text-sm text-stone-300"${_scopeId}> A history of your images, status, and exact final charges. </p></div>`);
						_push(ssrRenderComponent(unref(Link), {
							href: _ctx.route("dashboard"),
							class: "inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<span aria-hidden="true"${_scopeId}>+</span> Create an image `);
								else return [createVNode("span", { "aria-hidden": "true" }, "+"), createTextVNode(" Create an image ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("div", { class: "flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-stone-900 p-5 sm:p-6" }, [createVNode("div", null, [
						createVNode("p", { class: "text-xs font-semibold uppercase tracking-[0.18em] text-orange-600" }, " Pixelforge studio "),
						createVNode("h1", { class: "mt-1 text-xl font-semibold tracking-tight text-white" }, " Your generations "),
						createVNode("p", { class: "mt-1 text-sm text-stone-300" }, " A history of your images, status, and exact final charges. ")
					]), createVNode(unref(Link), {
						href: _ctx.route("dashboard"),
						class: "inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
					}, {
						default: withCtx(() => [createVNode("span", { "aria-hidden": "true" }, "+"), createTextVNode(" Create an image ")]),
						_: 1
					}, 8, ["href"])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12"${_scopeId}><div class="mx-auto max-w-5xl"${_scopeId}>`);
						if (__props.generations.length) {
							_push(`<div class="space-y-4"${_scopeId}><!--[-->`);
							ssrRenderList(__props.generations, (generation) => {
								_push(ssrRenderComponent(_sfc_main$2, {
									key: generation.id,
									generation
								}, null, _parent, _scopeId));
							});
							_push(`<!--]--></div>`);
						} else {
							_push(`<div class="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center"${_scopeId}><div class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-stone-400 shadow-sm"${_scopeId}><svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M4 5.75A1.75 1.75 0 015.75 4h12.5A1.75 1.75 0 0120 5.75v12.5A1.75 1.75 0 0118.25 20H5.75A1.75 1.75 0 014 18.25V5.75zM8 9h.01M4.5 16l4-4 3 3 3.5-4 5 5"${_scopeId}></path></svg></div><h2 class="mt-4 text-base font-semibold text-stone-800"${_scopeId}> Nothing here yet </h2><p class="mt-1 text-sm text-stone-500"${_scopeId}> Create your first image to start building your gallery. </p>`);
							_push(ssrRenderComponent(unref(Link), {
								href: _ctx.route("dashboard"),
								class: "mt-5 inline-flex rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`Start creating`);
									else return [createTextVNode("Start creating")];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div>`);
						}
						_push(`</div></div>`);
					} else return [createVNode("div", { class: "min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12" }, [createVNode("div", { class: "mx-auto max-w-5xl" }, [__props.generations.length ? (openBlock(), createBlock("div", {
						key: 0,
						class: "space-y-4"
					}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.generations, (generation) => {
						return openBlock(), createBlock(_sfc_main$2, {
							key: generation.id,
							generation
						}, null, 8, ["generation"]);
					}), 128))])) : (openBlock(), createBlock("div", {
						key: 1,
						class: "rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center"
					}, [
						createVNode("div", { class: "mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-stone-400 shadow-sm" }, [(openBlock(), createBlock("svg", {
							class: "size-5",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							"stroke-width": "1.7"
						}, [createVNode("path", {
							"stroke-linecap": "round",
							"stroke-linejoin": "round",
							d: "M4 5.75A1.75 1.75 0 015.75 4h12.5A1.75 1.75 0 0120 5.75v12.5A1.75 1.75 0 0118.25 20H5.75A1.75 1.75 0 014 18.25V5.75zM8 9h.01M4.5 16l4-4 3 3 3.5-4 5 5"
						})]))]),
						createVNode("h2", { class: "mt-4 text-base font-semibold text-stone-800" }, " Nothing here yet "),
						createVNode("p", { class: "mt-1 text-sm text-stone-500" }, " Create your first image to start building your gallery. "),
						createVNode(unref(Link), {
							href: _ctx.route("dashboard"),
							class: "mt-5 inline-flex rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
						}, {
							default: withCtx(() => [createTextVNode("Start creating")]),
							_: 1
						}, 8, ["href"])
					]))])])];
				}),
				_: 1
			}, _parent));
			_push(`<!--]-->`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Generations/Index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export { _sfc_main as default };
