import { t as _sfc_main$1 } from "./AppLayout-Czt4fV3t.js";
import { t as _sfc_main$2 } from "./GenerationCard-Ce2VKILM.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, openBlock, renderList, toDisplayString, unref, useSSRContext, vModelSelect, vModelText, watch, withCtx, withDirectives, withModifiers } from "vue";
import { Head, Link, useForm, usePoll } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
// resources/js/Pages/Dashboard.vue
var _sfc_main = {
	__name: "Dashboard",
	__ssrInlineRender: true,
	props: {
		pricing: {
			type: Object,
			required: true
		},
		requestId: {
			type: String,
			required: true
		},
		generations: {
			type: Array,
			required: true
		},
		credits: {
			type: Object,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const form = useForm({
			request_id: props.requestId,
			prompt: "",
			size: "1024x1024",
			quality: "medium",
			reference_images: [""]
		});
		const purchaseForm = useForm({ amount: "5" });
		const { start, stop } = usePoll(1e4, { only: ["generations"] }, { autoStart: false });
		watch(() => props.generations.some(({ status }) => status === "queued" || status === "processing"), (hasActiveGenerations) => hasActiveGenerations ? start() : stop(), { immediate: true });
		const parseUsdNanos = (amount) => {
			const [dollars, decimals = ""] = String(amount).split(".");
			return BigInt(dollars) * 1000000000n + BigInt(decimals.padEnd(9, "0").slice(0, 9));
		};
		const formatNanos = (amount) => {
			return `$${amount / 1000000000n}.${String(amount % 1000000000n).padStart(9, "0").replace(/0+$/, "").padEnd(4, "0")}`;
		};
		const estimate = computed(() => {
			if (!form.prompt.trim()) return null;
			const rates = props.pricing.rates;
			const tokenPrices = Object.fromEntries(Object.entries(rates).map(([key, value]) => [key, parseUsdNanos(value) / 1000000n]));
			const charactersPerTextToken = props.pricing.tokens.characters_per_text_token ?? 4;
			const reasoning = props.pricing.tokens.reasoning[form.quality];
			const promptTokenEstimate = Math.ceil([...form.prompt].length / charactersPerTextToken);
			const usage = {
				input_text_tokens: promptTokenEstimate,
				input_image_tokens: form.reference_images.filter((url) => url.trim()).length * props.pricing.tokens.per_reference_image,
				output_tokens: props.pricing.tokens.output[form.quality][form.size],
				reasoning_tokens: Math.floor((reasoning.min + reasoning.max) / 2)
			};
			const providerCost = (tokenUsage) => Object.entries(tokenUsage).reduce((total, [key, count]) => total + BigInt(count) * tokenPrices[key], 0n);
			const providerNanos = providerCost(usage);
			const customerNanos = (providerNanos * 5n + 2n) / 4n;
			const maximumCustomerNanos = (providerCost({
				...usage,
				input_text_tokens: Math.ceil(promptTokenEstimate * (1 + (props.pricing.tokens.text_token_variance ?? .15))),
				reasoning_tokens: reasoning.max
			}) * 5n + 2n) / 4n;
			return {
				provider: formatNanos(providerNanos),
				customer: formatNanos(customerNanos),
				maximumCustomer: formatNanos(maximumCustomerNanos),
				maximumCustomerNanos
			};
		});
		const canAffordMaximum = computed(() => estimate.value !== null && parseUsdNanos(props.credits.balance) >= estimate.value.maximumCustomerNanos);
		const addReferenceImage = () => {
			if (form.reference_images.length < 4) form.reference_images.push("");
		};
		const removeReferenceImage = (index) => {
			form.reference_images.splice(index, 1);
		};
		const submit = () => {
			if (!canAffordMaximum.value) return;
			form.reference_images = form.reference_images.filter((url) => url.trim() !== "");
			form.post(route("generations.store"), {
				preserveScroll: true,
				onSuccess: () => {
					form.reset("prompt", "reference_images");
					form.request_id = globalThis.crypto.randomUUID();
				}
			});
		};
		const buyCredits = () => {
			purchaseForm.post(route("credits.purchase"), { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: "Create an image" }, null, _parent));
			_push(ssrRenderComponent(_sfc_main$1, { title: "Create" }, {
				header: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-stone-900 p-5 sm:p-6"${_scopeId}><div${_scopeId}><p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600"${_scopeId}>Pixelforge studio</p><h1 class="mt-1 text-xl font-semibold tracking-tight text-white"${_scopeId}>Create an image</h1></div>`);
						_push(ssrRenderComponent(unref(Link), {
							href: _ctx.route("generations.index"),
							class: "text-sm font-semibold text-stone-300 transition hover:text-white"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` View history <span aria-hidden="true"${_scopeId}>→</span>`);
								else return [createTextVNode(" View history "), createVNode("span", { "aria-hidden": "true" }, "→")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("div", { class: "flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-stone-900 p-5 sm:p-6" }, [createVNode("div", null, [createVNode("p", { class: "text-xs font-semibold uppercase tracking-[0.18em] text-orange-600" }, "Pixelforge studio"), createVNode("h1", { class: "mt-1 text-xl font-semibold tracking-tight text-white" }, "Create an image")]), createVNode(unref(Link), {
						href: _ctx.route("generations.index"),
						class: "text-sm font-semibold text-stone-300 transition hover:text-white"
					}, {
						default: withCtx(() => [createTextVNode(" View history "), createVNode("span", { "aria-hidden": "true" }, "→")]),
						_: 1
					}, 8, ["href"])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12"${_scopeId}><div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]"${_scopeId}><div class="space-y-6"${_scopeId}><section class="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"${_scopeId}><div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"${_scopeId}><div${_scopeId}><p class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400"${_scopeId}>Available credits</p><p class="mt-1 text-2xl font-semibold tracking-tight text-stone-900"${_scopeId}>\$${ssrInterpolate(__props.credits.balance)}</p><p class="mt-1 text-xs text-stone-500"${_scopeId}>Demo credits only — no real payment is taken.</p></div><form class="flex flex-wrap items-center gap-2"${_scopeId}><label for="credit-amount" class="sr-only"${_scopeId}>Credit amount</label><select id="credit-amount" class="rounded-xl border-stone-200 bg-white py-2.5 text-sm text-stone-800 focus:border-orange-400 focus:ring-orange-400"${_scopeId}><!--[-->`);
						ssrRenderList(__props.credits.purchaseOptions, (amount) => {
							_push(`<option${ssrRenderAttr("value", amount)}${ssrIncludeBooleanAttr(Array.isArray(unref(purchaseForm).amount) ? ssrLooseContain(unref(purchaseForm).amount, amount) : ssrLooseEqual(unref(purchaseForm).amount, amount)) ? " selected" : ""}${_scopeId}>\$${ssrInterpolate(amount)} demo credits</option>`);
						});
						_push(`<!--]--></select><button type="submit"${ssrIncludeBooleanAttr(unref(purchaseForm).processing) ? " disabled" : ""} class="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"${_scopeId}>${ssrInterpolate(unref(purchaseForm).processing ? "Adding…" : "Buy credits")}</button></form></div></section><section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"${_scopeId}><div class="mb-8"${_scopeId}><div class="flex size-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"${_scopeId}><svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"${_scopeId}></path></svg></div><h2 class="mt-5 text-2xl font-semibold tracking-tight text-stone-900"${_scopeId}>Give your idea a canvas.</h2><p class="mt-2 max-w-lg text-sm leading-6 text-stone-500"${_scopeId}>Describe what you imagine, choose a format, and we’ll take it from there.</p></div><form class="space-y-6"${_scopeId}><div${_scopeId}><label for="prompt" class="mb-2 block text-sm font-semibold text-stone-800"${_scopeId}>Your prompt</label><textarea id="prompt" rows="5" maxlength="4000" required placeholder="A tiny glass greenhouse on a rainy rooftop at dusk, cinematic light..." class="w-full resize-y rounded-xl border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-900 placeholder:text-stone-400 focus:border-orange-400 focus:bg-white focus:ring-orange-400"${_scopeId}>${ssrInterpolate(unref(form).prompt)}</textarea><div class="mt-2 flex justify-between text-xs text-stone-400"${_scopeId}>`);
						if (unref(form).errors.prompt) _push(`<span class="text-rose-600"${_scopeId}>${ssrInterpolate(unref(form).errors.prompt)}</span>`);
						else _push(`<span${_scopeId}>Be as specific as you like.</span>`);
						_push(`<span${_scopeId}>${ssrInterpolate([...unref(form).prompt].length)} / 4,000</span></div></div><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><label for="size" class="mb-2 block text-sm font-semibold text-stone-800"${_scopeId}>Canvas size</label><select id="size" class="w-full rounded-xl border-stone-200 bg-white py-3 text-sm text-stone-800 focus:border-orange-400 focus:ring-orange-400"${_scopeId}><option value="1024x1024"${ssrIncludeBooleanAttr(Array.isArray(unref(form).size) ? ssrLooseContain(unref(form).size, "1024x1024") : ssrLooseEqual(unref(form).size, "1024x1024")) ? " selected" : ""}${_scopeId}>Square · 1024 × 1024</option><option value="1536x1024"${ssrIncludeBooleanAttr(Array.isArray(unref(form).size) ? ssrLooseContain(unref(form).size, "1536x1024") : ssrLooseEqual(unref(form).size, "1536x1024")) ? " selected" : ""}${_scopeId}>Landscape · 1536 × 1024</option><option value="1024x1536"${ssrIncludeBooleanAttr(Array.isArray(unref(form).size) ? ssrLooseContain(unref(form).size, "1024x1536") : ssrLooseEqual(unref(form).size, "1024x1536")) ? " selected" : ""}${_scopeId}>Portrait · 1024 × 1536</option></select></div><div${_scopeId}><label for="quality" class="mb-2 block text-sm font-semibold text-stone-800"${_scopeId}>Quality</label><select id="quality" class="w-full rounded-xl border-stone-200 bg-white py-3 text-sm capitalize text-stone-800 focus:border-orange-400 focus:ring-orange-400"${_scopeId}><option value="low"${ssrIncludeBooleanAttr(Array.isArray(unref(form).quality) ? ssrLooseContain(unref(form).quality, "low") : ssrLooseEqual(unref(form).quality, "low")) ? " selected" : ""}${_scopeId}>Low · quick draft</option><option value="medium"${ssrIncludeBooleanAttr(Array.isArray(unref(form).quality) ? ssrLooseContain(unref(form).quality, "medium") : ssrLooseEqual(unref(form).quality, "medium")) ? " selected" : ""}${_scopeId}>Medium · balanced</option><option value="high"${ssrIncludeBooleanAttr(Array.isArray(unref(form).quality) ? ssrLooseContain(unref(form).quality, "high") : ssrLooseEqual(unref(form).quality, "high")) ? " selected" : ""}${_scopeId}>High · fine detail</option></select></div></div><div${_scopeId}><div class="mb-2 flex items-center justify-between"${_scopeId}><label class="block text-sm font-semibold text-stone-800"${_scopeId}>Reference images <span class="font-normal text-stone-400"${_scopeId}>· optional</span></label>`);
						if (unref(form).reference_images.length < 4) _push(`<button type="button" class="text-xs font-semibold text-orange-700 hover:text-orange-800"${_scopeId}> + Add URL </button>`);
						else _push(`<!---->`);
						_push(`</div><div class="space-y-2"${_scopeId}><!--[-->`);
						ssrRenderList(unref(form).reference_images, (url, index) => {
							_push(`<div class="flex gap-2"${_scopeId}><input${ssrRenderAttr("value", unref(form).reference_images[index])} type="url" placeholder="https://example.com/image.png" class="min-w-0 flex-1 rounded-xl border-stone-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:ring-orange-400"${_scopeId}>`);
							if (unref(form).reference_images.length > 1) _push(`<button type="button" class="rounded-xl px-3 text-stone-400 hover:bg-stone-100 hover:text-stone-700"${ssrRenderAttr("aria-label", `Remove reference image ${index + 1}`)}${_scopeId}> × </button>`);
							else _push(`<!---->`);
							_push(`</div>`);
						});
						_push(`<!--]--></div>`);
						if (unref(form).errors.reference_images || unref(form).errors["reference_images.0"]) _push(`<p class="mt-2 text-xs text-rose-600"${_scopeId}>${ssrInterpolate(unref(form).errors.reference_images || unref(form).errors["reference_images.0"])}</p>`);
						else _push(`<p class="mt-2 text-xs text-stone-400"${_scopeId}>Add up to four publicly accessible image URLs.</p>`);
						_push(`</div><div class="rounded-2xl border border-orange-100 bg-orange-50/60 p-4"${_scopeId}><div class="flex items-start justify-between gap-5"${_scopeId}><div${_scopeId}><p class="text-sm font-semibold text-stone-800"${_scopeId}>Estimated cost</p><p class="mt-1 text-xs leading-5 text-stone-500"${_scopeId}>Pixelforge usage plus a 25% service markup.</p></div>`);
						if (estimate.value) _push(`<div class="text-right"${_scopeId}><p class="text-xl font-semibold tracking-tight text-stone-900"${_scopeId}>${ssrInterpolate(estimate.value.customer)}</p><p class="mt-1 text-xs text-stone-500"${_scopeId}>provider ${ssrInterpolate(estimate.value.provider)}</p></div>`);
						else _push(`<p class="text-sm font-medium text-stone-400"${_scopeId}>Add a prompt to estimate</p>`);
						_push(`</div><p class="mt-3 border-t border-orange-100 pt-3 text-[11px] leading-5 text-stone-500"${_scopeId}> Estimate uses average text and reasoning tokens. Final cost is calculated from exact usage; failed generations are free. </p>`);
						if (estimate.value) _push(`<p class="mt-2 text-xs leading-5 text-stone-600"${_scopeId}> Up to ${ssrInterpolate(estimate.value.maximumCustomer)} may be held while the image is processing; unused credits are released when it finishes. </p>`);
						else _push(`<!---->`);
						if (estimate.value && !canAffordMaximum.value) _push(`<p class="mt-2 text-xs font-medium text-rose-700"${_scopeId}> Your balance is too low to cover this generation&#39;s maximum possible charge. Buy credits to continue. </p>`);
						else _push(`<!---->`);
						_push(`</div><button type="submit"${ssrIncludeBooleanAttr(unref(form).processing || !unref(form).prompt.trim() || !canAffordMaximum.value) ? " disabled" : ""} class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"${_scopeId}>`);
						if (unref(form).processing) _push(`<svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"${_scopeId}></path></svg>`);
						else _push(`<!---->`);
						_push(` ${ssrInterpolate(unref(form).processing ? "Sending to Pixelforge…" : "Generate image")}</button></form></section></div><section class="space-y-5"${_scopeId}><div class="flex items-end justify-between"${_scopeId}><div${_scopeId}><p class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400"${_scopeId}>Your workspace</p><h2 class="mt-1 text-lg font-semibold text-stone-900"${_scopeId}>Recent generations</h2></div>`);
						_push(ssrRenderComponent(unref(Link), {
							href: _ctx.route("generations.index"),
							class: "text-xs font-semibold text-orange-700 hover:text-orange-800"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`See all`);
								else return [createTextVNode("See all")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
						if (__props.generations.length) {
							_push(`<div class="space-y-4"${_scopeId}><!--[-->`);
							ssrRenderList(__props.generations, (generation) => {
								_push(ssrRenderComponent(_sfc_main$2, {
									key: generation.id,
									generation
								}, null, _parent, _scopeId));
							});
							_push(`<!--]--></div>`);
						} else _push(`<div class="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center"${_scopeId}><div class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-stone-400 shadow-sm"${_scopeId}><svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M4 5.75A1.75 1.75 0 015.75 4h12.5A1.75 1.75 0 0120 5.75v12.5A1.75 1.75 0 0118.25 20H5.75A1.75 1.75 0 014 18.25V5.75zM8 9h.01M4.5 16l4-4 3 3 3.5-4 5 5"${_scopeId}></path></svg></div><h3 class="mt-4 text-sm font-semibold text-stone-800"${_scopeId}>Your canvas is ready</h3><p class="mt-1 text-sm text-stone-500"${_scopeId}>Your first image will appear here.</p></div>`);
						_push(`</section></div></div>`);
					} else return [createVNode("div", { class: "min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12" }, [createVNode("div", { class: "mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]" }, [createVNode("div", { class: "space-y-6" }, [createVNode("section", { class: "rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6" }, [createVNode("div", { class: "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between" }, [createVNode("div", null, [
						createVNode("p", { class: "text-xs font-semibold uppercase tracking-[0.16em] text-stone-400" }, "Available credits"),
						createVNode("p", { class: "mt-1 text-2xl font-semibold tracking-tight text-stone-900" }, "$" + toDisplayString(__props.credits.balance), 1),
						createVNode("p", { class: "mt-1 text-xs text-stone-500" }, "Demo credits only — no real payment is taken.")
					]), createVNode("form", {
						class: "flex flex-wrap items-center gap-2",
						onSubmit: withModifiers(buyCredits, ["prevent"])
					}, [
						createVNode("label", {
							for: "credit-amount",
							class: "sr-only"
						}, "Credit amount"),
						withDirectives(createVNode("select", {
							id: "credit-amount",
							"onUpdate:modelValue": ($event) => unref(purchaseForm).amount = $event,
							class: "rounded-xl border-stone-200 bg-white py-2.5 text-sm text-stone-800 focus:border-orange-400 focus:ring-orange-400"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.credits.purchaseOptions, (amount) => {
							return openBlock(), createBlock("option", {
								key: amount,
								value: amount
							}, "$" + toDisplayString(amount) + " demo credits", 9, ["value"]);
						}), 128))], 8, ["onUpdate:modelValue"]), [[vModelSelect, unref(purchaseForm).amount]]),
						createVNode("button", {
							type: "submit",
							disabled: unref(purchaseForm).processing,
							class: "rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
						}, toDisplayString(unref(purchaseForm).processing ? "Adding…" : "Buy credits"), 9, ["disabled"])
					], 32)])]), createVNode("section", { class: "rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8" }, [createVNode("div", { class: "mb-8" }, [
						createVNode("div", { class: "flex size-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600" }, [(openBlock(), createBlock("svg", {
							class: "size-5",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							"stroke-width": "1.7"
						}, [createVNode("path", {
							"stroke-linecap": "round",
							"stroke-linejoin": "round",
							d: "M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"
						})]))]),
						createVNode("h2", { class: "mt-5 text-2xl font-semibold tracking-tight text-stone-900" }, "Give your idea a canvas."),
						createVNode("p", { class: "mt-2 max-w-lg text-sm leading-6 text-stone-500" }, "Describe what you imagine, choose a format, and we’ll take it from there.")
					]), createVNode("form", {
						class: "space-y-6",
						onSubmit: withModifiers(submit, ["prevent"])
					}, [
						createVNode("div", null, [
							createVNode("label", {
								for: "prompt",
								class: "mb-2 block text-sm font-semibold text-stone-800"
							}, "Your prompt"),
							withDirectives(createVNode("textarea", {
								id: "prompt",
								"onUpdate:modelValue": ($event) => unref(form).prompt = $event,
								rows: "5",
								maxlength: "4000",
								required: "",
								placeholder: "A tiny glass greenhouse on a rainy rooftop at dusk, cinematic light...",
								class: "w-full resize-y rounded-xl border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-900 placeholder:text-stone-400 focus:border-orange-400 focus:bg-white focus:ring-orange-400"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).prompt]]),
							createVNode("div", { class: "mt-2 flex justify-between text-xs text-stone-400" }, [unref(form).errors.prompt ? (openBlock(), createBlock("span", {
								key: 0,
								class: "text-rose-600"
							}, toDisplayString(unref(form).errors.prompt), 1)) : (openBlock(), createBlock("span", { key: 1 }, "Be as specific as you like.")), createVNode("span", null, toDisplayString([...unref(form).prompt].length) + " / 4,000", 1)])
						]),
						createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [createVNode("div", null, [createVNode("label", {
							for: "size",
							class: "mb-2 block text-sm font-semibold text-stone-800"
						}, "Canvas size"), withDirectives(createVNode("select", {
							id: "size",
							"onUpdate:modelValue": ($event) => unref(form).size = $event,
							class: "w-full rounded-xl border-stone-200 bg-white py-3 text-sm text-stone-800 focus:border-orange-400 focus:ring-orange-400"
						}, [
							createVNode("option", { value: "1024x1024" }, "Square · 1024 × 1024"),
							createVNode("option", { value: "1536x1024" }, "Landscape · 1536 × 1024"),
							createVNode("option", { value: "1024x1536" }, "Portrait · 1024 × 1536")
						], 8, ["onUpdate:modelValue"]), [[vModelSelect, unref(form).size]])]), createVNode("div", null, [createVNode("label", {
							for: "quality",
							class: "mb-2 block text-sm font-semibold text-stone-800"
						}, "Quality"), withDirectives(createVNode("select", {
							id: "quality",
							"onUpdate:modelValue": ($event) => unref(form).quality = $event,
							class: "w-full rounded-xl border-stone-200 bg-white py-3 text-sm capitalize text-stone-800 focus:border-orange-400 focus:ring-orange-400"
						}, [
							createVNode("option", { value: "low" }, "Low · quick draft"),
							createVNode("option", { value: "medium" }, "Medium · balanced"),
							createVNode("option", { value: "high" }, "High · fine detail")
						], 8, ["onUpdate:modelValue"]), [[vModelSelect, unref(form).quality]])])]),
						createVNode("div", null, [
							createVNode("div", { class: "mb-2 flex items-center justify-between" }, [createVNode("label", { class: "block text-sm font-semibold text-stone-800" }, [createTextVNode("Reference images "), createVNode("span", { class: "font-normal text-stone-400" }, "· optional")]), unref(form).reference_images.length < 4 ? (openBlock(), createBlock("button", {
								key: 0,
								type: "button",
								class: "text-xs font-semibold text-orange-700 hover:text-orange-800",
								onClick: addReferenceImage
							}, " + Add URL ")) : createCommentVNode("", true)]),
							createVNode("div", { class: "space-y-2" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(form).reference_images, (url, index) => {
								return openBlock(), createBlock("div", {
									key: index,
									class: "flex gap-2"
								}, [withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => unref(form).reference_images[index] = $event,
									type: "url",
									placeholder: "https://example.com/image.png",
									class: "min-w-0 flex-1 rounded-xl border-stone-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:ring-orange-400"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).reference_images[index]]]), unref(form).reference_images.length > 1 ? (openBlock(), createBlock("button", {
									key: 0,
									type: "button",
									class: "rounded-xl px-3 text-stone-400 hover:bg-stone-100 hover:text-stone-700",
									"aria-label": `Remove reference image ${index + 1}`,
									onClick: ($event) => removeReferenceImage(index)
								}, " × ", 8, ["aria-label", "onClick"])) : createCommentVNode("", true)]);
							}), 128))]),
							unref(form).errors.reference_images || unref(form).errors["reference_images.0"] ? (openBlock(), createBlock("p", {
								key: 0,
								class: "mt-2 text-xs text-rose-600"
							}, toDisplayString(unref(form).errors.reference_images || unref(form).errors["reference_images.0"]), 1)) : (openBlock(), createBlock("p", {
								key: 1,
								class: "mt-2 text-xs text-stone-400"
							}, "Add up to four publicly accessible image URLs."))
						]),
						createVNode("div", { class: "rounded-2xl border border-orange-100 bg-orange-50/60 p-4" }, [
							createVNode("div", { class: "flex items-start justify-between gap-5" }, [createVNode("div", null, [createVNode("p", { class: "text-sm font-semibold text-stone-800" }, "Estimated cost"), createVNode("p", { class: "mt-1 text-xs leading-5 text-stone-500" }, "Pixelforge usage plus a 25% service markup.")]), estimate.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: "text-right"
							}, [createVNode("p", { class: "text-xl font-semibold tracking-tight text-stone-900" }, toDisplayString(estimate.value.customer), 1), createVNode("p", { class: "mt-1 text-xs text-stone-500" }, "provider " + toDisplayString(estimate.value.provider), 1)])) : (openBlock(), createBlock("p", {
								key: 1,
								class: "text-sm font-medium text-stone-400"
							}, "Add a prompt to estimate"))]),
							createVNode("p", { class: "mt-3 border-t border-orange-100 pt-3 text-[11px] leading-5 text-stone-500" }, " Estimate uses average text and reasoning tokens. Final cost is calculated from exact usage; failed generations are free. "),
							estimate.value ? (openBlock(), createBlock("p", {
								key: 0,
								class: "mt-2 text-xs leading-5 text-stone-600"
							}, " Up to " + toDisplayString(estimate.value.maximumCustomer) + " may be held while the image is processing; unused credits are released when it finishes. ", 1)) : createCommentVNode("", true),
							estimate.value && !canAffordMaximum.value ? (openBlock(), createBlock("p", {
								key: 1,
								class: "mt-2 text-xs font-medium text-rose-700"
							}, " Your balance is too low to cover this generation's maximum possible charge. Buy credits to continue. ")) : createCommentVNode("", true)
						]),
						createVNode("button", {
							type: "submit",
							disabled: unref(form).processing || !unref(form).prompt.trim() || !canAffordMaximum.value,
							class: "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						}, [unref(form).processing ? (openBlock(), createBlock("svg", {
							key: 0,
							class: "size-4 animate-spin",
							viewBox: "0 0 24 24",
							fill: "none"
						}, [createVNode("circle", {
							class: "opacity-25",
							cx: "12",
							cy: "12",
							r: "10",
							stroke: "currentColor",
							"stroke-width": "3"
						}), createVNode("path", {
							class: "opacity-75",
							fill: "currentColor",
							d: "M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
						})])) : createCommentVNode("", true), createTextVNode(" " + toDisplayString(unref(form).processing ? "Sending to Pixelforge…" : "Generate image"), 1)], 8, ["disabled"])
					], 32)])]), createVNode("section", { class: "space-y-5" }, [createVNode("div", { class: "flex items-end justify-between" }, [createVNode("div", null, [createVNode("p", { class: "text-xs font-semibold uppercase tracking-[0.16em] text-stone-400" }, "Your workspace"), createVNode("h2", { class: "mt-1 text-lg font-semibold text-stone-900" }, "Recent generations")]), createVNode(unref(Link), {
						href: _ctx.route("generations.index"),
						class: "text-xs font-semibold text-orange-700 hover:text-orange-800"
					}, {
						default: withCtx(() => [createTextVNode("See all")]),
						_: 1
					}, 8, ["href"])]), __props.generations.length ? (openBlock(), createBlock("div", {
						key: 0,
						class: "space-y-4"
					}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.generations, (generation) => {
						return openBlock(), createBlock(_sfc_main$2, {
							key: generation.id,
							generation
						}, null, 8, ["generation"]);
					}), 128))])) : (openBlock(), createBlock("div", {
						key: 1,
						class: "rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center"
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
						createVNode("h3", { class: "mt-4 text-sm font-semibold text-stone-800" }, "Your canvas is ready"),
						createVNode("p", { class: "mt-1 text-sm text-stone-500" }, "Your first image will appear here.")
					]))])])])];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Dashboard.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export { _sfc_main as default };
