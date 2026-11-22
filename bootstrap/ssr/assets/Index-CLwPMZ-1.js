import { t as _sfc_main$1 } from "./AppLayout-Czt4fV3t.js";
import { Fragment, createBlock, createCommentVNode, createVNode, mergeProps, openBlock, renderList, toDisplayString, unref, useSSRContext, vModelText, withCtx, withDirectives, withModifiers } from "vue";
import { useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
// resources/js/Pages/Admin/Usage/Index.vue
var _sfc_main = {
	__name: "Index",
	__ssrInlineRender: true,
	props: {
		startDate: {
			type: String,
			required: true
		},
		endDate: {
			type: String,
			required: true
		},
		daily: {
			type: Array,
			required: true
		},
		byUser: {
			type: Array,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const form = useForm({
			start_date: props.startDate,
			end_date: props.endDate
		});
		const filter = () => form.get(route("admin.pixelforge.usage"), { preserveScroll: true });
		const currency = (amount) => `$${amount}`;
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$1, mergeProps({ title: "Pixelforge usage report" }, _attrs), {
				header: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="rounded-2xl bg-stone-900 p-5 sm:p-6"${_scopeId}><p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600"${_scopeId}>Operator report</p><h1 class="mt-1 text-xl font-semibold tracking-tight text-white"${_scopeId}>Usage and profit</h1></div>`);
					else return [createVNode("div", { class: "rounded-2xl bg-stone-900 p-5 sm:p-6" }, [createVNode("p", { class: "text-xs font-semibold uppercase tracking-[0.18em] text-orange-600" }, "Operator report"), createVNode("h1", { class: "mt-1 text-xl font-semibold tracking-tight text-white" }, "Usage and profit")])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12"${_scopeId}><div class="mx-auto max-w-7xl space-y-8"${_scopeId}><section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"${_scopeId}><div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"${_scopeId}><div${_scopeId}><h2 class="text-lg font-semibold text-stone-900"${_scopeId}>Provider reconciliation</h2><p class="mt-1 max-w-2xl text-sm leading-6 text-stone-500"${_scopeId}> Provider costs are loaded directly from Pixelforge’s usage API. Dates use UTC completion day. A zero difference means the local per-generation costs match the provider total. </p></div><form class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"${_scopeId}><div${_scopeId}><label for="start-date" class="mb-1 block text-xs font-semibold text-stone-600"${_scopeId}>From (UTC)</label><input id="start-date"${ssrRenderAttr("value", unref(form).start_date)} type="date" required class="rounded-xl border-stone-200 text-sm focus:border-orange-400 focus:ring-orange-400"${_scopeId}>`);
						if (unref(form).errors.start_date) _push(`<p class="mt-1 text-xs text-rose-600"${_scopeId}>${ssrInterpolate(unref(form).errors.start_date)}</p>`);
						else _push(`<!---->`);
						_push(`</div><div${_scopeId}><label for="end-date" class="mb-1 block text-xs font-semibold text-stone-600"${_scopeId}>To (UTC)</label><input id="end-date"${ssrRenderAttr("value", unref(form).end_date)} type="date" required class="rounded-xl border-stone-200 text-sm focus:border-orange-400 focus:ring-orange-400"${_scopeId}>`);
						if (unref(form).errors.end_date) _push(`<p class="mt-1 text-xs text-rose-600"${_scopeId}>${ssrInterpolate(unref(form).errors.end_date)}</p>`);
						else _push(`<!---->`);
						_push(`</div><button type="submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} class="self-end rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"${_scopeId}>${ssrInterpolate(unref(form).processing ? "Loading…" : "Apply dates")}</button></form></div></section><section class="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"${_scopeId}><div class="border-b border-stone-100 px-6 py-5"${_scopeId}><h2 class="font-semibold text-stone-900"${_scopeId}>Daily totals</h2></div><div class="overflow-x-auto"${_scopeId}><table class="w-full min-w-[860px] text-left text-sm"${_scopeId}><thead class="bg-stone-50 text-xs uppercase tracking-wide text-stone-500"${_scopeId}><tr${_scopeId}><th class="px-6 py-3 font-semibold"${_scopeId}>Date (UTC)</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>Generations</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>Provider (API)</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>Provider (local)</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>Difference</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>User charges</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>Profit</th></tr></thead><tbody class="divide-y divide-stone-100"${_scopeId}><!--[-->`);
						ssrRenderList(__props.daily, (day) => {
							_push(`<tr${_scopeId}><td class="whitespace-nowrap px-6 py-4 font-medium text-stone-800"${_scopeId}>${ssrInterpolate(day.date)}</td><td class="px-6 py-4 text-right text-stone-600"${_scopeId}>${ssrInterpolate(day.generations)}</td><td class="px-6 py-4 text-right text-stone-600"${_scopeId}>${ssrInterpolate(currency(day.provider_reported))}</td><td class="px-6 py-4 text-right text-stone-600"${_scopeId}>${ssrInterpolate(currency(day.provider_recorded))}</td><td class="${ssrRenderClass([day.reconciliation_difference_nanos === 0 ? "text-emerald-700" : "text-rose-700", "px-6 py-4 text-right font-medium"])}"${_scopeId}>${ssrInterpolate(currency(day.reconciliation_difference))}</td><td class="px-6 py-4 text-right text-stone-600"${_scopeId}>${ssrInterpolate(currency(day.customer_charge))}</td><td class="px-6 py-4 text-right font-semibold text-stone-900"${_scopeId}>${ssrInterpolate(currency(day.profit))}</td></tr>`);
						});
						_push(`<!--]-->`);
						if (__props.daily.length === 0) _push(`<tr${_scopeId}><td colspan="7" class="px-6 py-10 text-center text-sm text-stone-500"${_scopeId}>No usage in this date range.</td></tr>`);
						else _push(`<!---->`);
						_push(`</tbody></table></div></section><section class="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"${_scopeId}><div class="border-b border-stone-100 px-6 py-5"${_scopeId}><h2 class="font-semibold text-stone-900"${_scopeId}>Daily breakdown by user</h2></div><div class="overflow-x-auto"${_scopeId}><table class="w-full min-w-[660px] text-left text-sm"${_scopeId}><thead class="bg-stone-50 text-xs uppercase tracking-wide text-stone-500"${_scopeId}><tr${_scopeId}><th class="px-6 py-3 font-semibold"${_scopeId}>Date (UTC)</th><th class="px-6 py-3 font-semibold"${_scopeId}>User</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>Generations</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>Provider cost</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>User charges</th><th class="px-6 py-3 text-right font-semibold"${_scopeId}>Profit</th></tr></thead><tbody class="divide-y divide-stone-100"${_scopeId}><!--[-->`);
						ssrRenderList(__props.byUser, (row) => {
							_push(`<tr${_scopeId}><td class="whitespace-nowrap px-6 py-4 text-stone-600"${_scopeId}>${ssrInterpolate(row.date)}</td><td class="px-6 py-4 font-medium text-stone-800"${_scopeId}>${ssrInterpolate(row.user_name)}</td><td class="px-6 py-4 text-right text-stone-600"${_scopeId}>${ssrInterpolate(row.generations)}</td><td class="px-6 py-4 text-right text-stone-600"${_scopeId}>${ssrInterpolate(currency(row.provider_cost))}</td><td class="px-6 py-4 text-right text-stone-600"${_scopeId}>${ssrInterpolate(currency(row.customer_charge))}</td><td class="px-6 py-4 text-right font-semibold text-stone-900"${_scopeId}>${ssrInterpolate(currency(row.profit))}</td></tr>`);
						});
						_push(`<!--]-->`);
						if (__props.byUser.length === 0) _push(`<tr${_scopeId}><td colspan="6" class="px-6 py-10 text-center text-sm text-stone-500"${_scopeId}>No completed generations in this date range.</td></tr>`);
						else _push(`<!---->`);
						_push(`</tbody></table></div></section></div></div>`);
					} else return [createVNode("div", { class: "min-h-[calc(100vh-9rem)] bg-[#f7f6f3] px-4 py-8 sm:px-6 lg:py-12" }, [createVNode("div", { class: "mx-auto max-w-7xl space-y-8" }, [
						createVNode("section", { class: "rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" }, [createVNode("div", { class: "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" }, [createVNode("div", null, [createVNode("h2", { class: "text-lg font-semibold text-stone-900" }, "Provider reconciliation"), createVNode("p", { class: "mt-1 max-w-2xl text-sm leading-6 text-stone-500" }, " Provider costs are loaded directly from Pixelforge’s usage API. Dates use UTC completion day. A zero difference means the local per-generation costs match the provider total. ")]), createVNode("form", {
							class: "grid gap-3 sm:grid-cols-[1fr_1fr_auto]",
							onSubmit: withModifiers(filter, ["prevent"])
						}, [
							createVNode("div", null, [
								createVNode("label", {
									for: "start-date",
									class: "mb-1 block text-xs font-semibold text-stone-600"
								}, "From (UTC)"),
								withDirectives(createVNode("input", {
									id: "start-date",
									"onUpdate:modelValue": ($event) => unref(form).start_date = $event,
									type: "date",
									required: "",
									class: "rounded-xl border-stone-200 text-sm focus:border-orange-400 focus:ring-orange-400"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).start_date]]),
								unref(form).errors.start_date ? (openBlock(), createBlock("p", {
									key: 0,
									class: "mt-1 text-xs text-rose-600"
								}, toDisplayString(unref(form).errors.start_date), 1)) : createCommentVNode("", true)
							]),
							createVNode("div", null, [
								createVNode("label", {
									for: "end-date",
									class: "mb-1 block text-xs font-semibold text-stone-600"
								}, "To (UTC)"),
								withDirectives(createVNode("input", {
									id: "end-date",
									"onUpdate:modelValue": ($event) => unref(form).end_date = $event,
									type: "date",
									required: "",
									class: "rounded-xl border-stone-200 text-sm focus:border-orange-400 focus:ring-orange-400"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).end_date]]),
								unref(form).errors.end_date ? (openBlock(), createBlock("p", {
									key: 0,
									class: "mt-1 text-xs text-rose-600"
								}, toDisplayString(unref(form).errors.end_date), 1)) : createCommentVNode("", true)
							]),
							createVNode("button", {
								type: "submit",
								disabled: unref(form).processing,
								class: "self-end rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
							}, toDisplayString(unref(form).processing ? "Loading…" : "Apply dates"), 9, ["disabled"])
						], 32)])]),
						createVNode("section", { class: "overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm" }, [createVNode("div", { class: "border-b border-stone-100 px-6 py-5" }, [createVNode("h2", { class: "font-semibold text-stone-900" }, "Daily totals")]), createVNode("div", { class: "overflow-x-auto" }, [createVNode("table", { class: "w-full min-w-[860px] text-left text-sm" }, [createVNode("thead", { class: "bg-stone-50 text-xs uppercase tracking-wide text-stone-500" }, [createVNode("tr", null, [
							createVNode("th", { class: "px-6 py-3 font-semibold" }, "Date (UTC)"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "Generations"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "Provider (API)"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "Provider (local)"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "Difference"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "User charges"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "Profit")
						])]), createVNode("tbody", { class: "divide-y divide-stone-100" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.daily, (day) => {
							return openBlock(), createBlock("tr", { key: day.date }, [
								createVNode("td", { class: "whitespace-nowrap px-6 py-4 font-medium text-stone-800" }, toDisplayString(day.date), 1),
								createVNode("td", { class: "px-6 py-4 text-right text-stone-600" }, toDisplayString(day.generations), 1),
								createVNode("td", { class: "px-6 py-4 text-right text-stone-600" }, toDisplayString(currency(day.provider_reported)), 1),
								createVNode("td", { class: "px-6 py-4 text-right text-stone-600" }, toDisplayString(currency(day.provider_recorded)), 1),
								createVNode("td", { class: ["px-6 py-4 text-right font-medium", day.reconciliation_difference_nanos === 0 ? "text-emerald-700" : "text-rose-700"] }, toDisplayString(currency(day.reconciliation_difference)), 3),
								createVNode("td", { class: "px-6 py-4 text-right text-stone-600" }, toDisplayString(currency(day.customer_charge)), 1),
								createVNode("td", { class: "px-6 py-4 text-right font-semibold text-stone-900" }, toDisplayString(currency(day.profit)), 1)
							]);
						}), 128)), __props.daily.length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [createVNode("td", {
							colspan: "7",
							class: "px-6 py-10 text-center text-sm text-stone-500"
						}, "No usage in this date range.")])) : createCommentVNode("", true)])])])]),
						createVNode("section", { class: "overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm" }, [createVNode("div", { class: "border-b border-stone-100 px-6 py-5" }, [createVNode("h2", { class: "font-semibold text-stone-900" }, "Daily breakdown by user")]), createVNode("div", { class: "overflow-x-auto" }, [createVNode("table", { class: "w-full min-w-[660px] text-left text-sm" }, [createVNode("thead", { class: "bg-stone-50 text-xs uppercase tracking-wide text-stone-500" }, [createVNode("tr", null, [
							createVNode("th", { class: "px-6 py-3 font-semibold" }, "Date (UTC)"),
							createVNode("th", { class: "px-6 py-3 font-semibold" }, "User"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "Generations"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "Provider cost"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "User charges"),
							createVNode("th", { class: "px-6 py-3 text-right font-semibold" }, "Profit")
						])]), createVNode("tbody", { class: "divide-y divide-stone-100" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.byUser, (row) => {
							return openBlock(), createBlock("tr", { key: `${row.date}-${row.user_id}` }, [
								createVNode("td", { class: "whitespace-nowrap px-6 py-4 text-stone-600" }, toDisplayString(row.date), 1),
								createVNode("td", { class: "px-6 py-4 font-medium text-stone-800" }, toDisplayString(row.user_name), 1),
								createVNode("td", { class: "px-6 py-4 text-right text-stone-600" }, toDisplayString(row.generations), 1),
								createVNode("td", { class: "px-6 py-4 text-right text-stone-600" }, toDisplayString(currency(row.provider_cost)), 1),
								createVNode("td", { class: "px-6 py-4 text-right text-stone-600" }, toDisplayString(currency(row.customer_charge)), 1),
								createVNode("td", { class: "px-6 py-4 text-right font-semibold text-stone-900" }, toDisplayString(currency(row.profit)), 1)
							]);
						}), 128)), __props.byUser.length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [createVNode("td", {
							colspan: "6",
							class: "px-6 py-10 text-center text-sm text-stone-500"
						}, "No completed generations in this date range.")])) : createCommentVNode("", true)])])])])
					])])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Usage/Index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export { _sfc_main as default };
