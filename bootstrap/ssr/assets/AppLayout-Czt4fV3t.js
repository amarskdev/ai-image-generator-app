import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-DjkACiAr.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, onMounted, onUnmounted, openBlock, ref, renderList, renderSlot, toDisplayString, unref, useSSRContext, watchEffect, withCtx, withModifiers } from "vue";
import { Head, Link, router, usePage } from "@inertiajs/vue3";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
// resources/js/Components/ApplicationMark.vue
var _sfc_main$6 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
	_push(`<svg${ssrRenderAttrs(mergeProps({
		viewBox: "0 0 40 40",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-label": "PixelForge"
	}, _attrs))}><rect width="40" height="40" rx="12" fill="#171717"></rect><path d="M12 12h16v16H12z" fill="#FA714B"></path><path d="M18 18h10v10H18z" fill="#FDBA74"></path><path d="M12 12h6v6h-6z" fill="#FFF7ED"></path></svg>`);
}
var _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/ApplicationMark.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var ApplicationMark_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$6, [["ssrRender", _sfc_ssrRender]]);
// resources/js/Components/Banner.vue
var _sfc_main$5 = {
	__name: "Banner",
	__ssrInlineRender: true,
	setup(__props) {
		const page = usePage();
		const show = ref(true);
		const style = ref("success");
		const message = ref("");
		watchEffect(async () => {
			style.value = page.props.jetstream.flash?.bannerStyle || "success";
			message.value = page.props.jetstream.flash?.banner || "";
			show.value = true;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)}>`);
			if (show.value && message.value) {
				_push(`<div class="${ssrRenderClass({
					"bg-indigo-500": style.value == "success",
					"bg-red-700": style.value == "danger"
				})}"><div class="max-w-screen-xl mx-auto py-2 px-3 sm:px-6 lg:px-8"><div class="flex items-center justify-between flex-wrap"><div class="w-0 flex-1 flex items-center min-w-0"><span class="${ssrRenderClass([{
					"bg-indigo-600": style.value == "success",
					"bg-red-600": style.value == "danger"
				}, "flex p-2 rounded-lg"])}">`);
				if (style.value == "success") _push(`<svg class="size-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`);
				else _push(`<!---->`);
				if (style.value == "danger") _push(`<svg class="size-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg>`);
				else _push(`<!---->`);
				_push(`</span><p class="ms-3 font-medium text-sm text-white truncate">${ssrInterpolate(message.value)}</p></div><div class="shrink-0 sm:ms-3"><button type="button" class="${ssrRenderClass([{
					"hover:bg-indigo-600 focus:bg-indigo-600": style.value == "success",
					"hover:bg-red-600 focus:bg-red-600": style.value == "danger"
				}, "-me-1 flex p-2 rounded-md focus:outline-none sm:-me-2 transition"])}" aria-label="Dismiss"><svg class="size-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div></div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Banner.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
// resources/js/Components/Dropdown.vue
var _sfc_main$4 = {
	__name: "Dropdown",
	__ssrInlineRender: true,
	props: {
		align: {
			type: String,
			default: "right"
		},
		width: {
			type: String,
			default: "48"
		},
		contentClasses: {
			type: Array,
			default: () => ["py-1", "bg-white dark:bg-gray-700"]
		}
	},
	setup(__props) {
		const props = __props;
		let open = ref(false);
		const closeOnEscape = (e) => {
			if (open.value && e.key === "Escape") open.value = false;
		};
		onMounted(() => document.addEventListener("keydown", closeOnEscape));
		onUnmounted(() => document.removeEventListener("keydown", closeOnEscape));
		const widthClass = computed(() => {
			return { "48": "w-48" }[props.width.toString()];
		});
		const alignmentClasses = computed(() => {
			if (props.align === "left") return "ltr:origin-top-left rtl:origin-top-right start-0";
			if (props.align === "right") return "ltr:origin-top-right rtl:origin-top-left end-0";
			return "origin-top";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))}><div>`);
			ssrRenderSlot(_ctx.$slots, "trigger", {}, null, _push, _parent);
			_push(`</div><div class="fixed inset-0 z-40" style="${ssrRenderStyle(unref(open) ? null : { display: "none" })}"></div><div class="${ssrRenderClass([[widthClass.value, alignmentClasses.value], "absolute z-50 mt-2 rounded-md shadow-lg"])}" style="${ssrRenderStyle([{ "display": "none" }, unref(open) ? null : { display: "none" }])}"><div class="${ssrRenderClass([__props.contentClasses, "rounded-md ring-1 ring-black ring-opacity-5"])}">`);
			ssrRenderSlot(_ctx.$slots, "content", {}, null, _push, _parent);
			_push(`</div></div></div>`);
		};
	}
};
var _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Dropdown.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
// resources/js/Components/DropdownLink.vue
var _sfc_main$3 = {
	__name: "DropdownLink",
	__ssrInlineRender: true,
	props: {
		href: String,
		as: String
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)}>`);
			if (__props.as == "button") {
				_push(`<button type="submit" class="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition duration-150 ease-in-out">`);
				ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
				_push(`</button>`);
			} else if (__props.as == "a") {
				_push(`<a${ssrRenderAttr("href", __props.href)} class="block px-4 py-2 text-sm leading-5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition duration-150 ease-in-out">`);
				ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
				_push(`</a>`);
			} else _push(ssrRenderComponent(unref(Link), {
				href: __props.href,
				class: "block px-4 py-2 text-sm leading-5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition duration-150 ease-in-out"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
			_push(`</div>`);
		};
	}
};
var _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/DropdownLink.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
// resources/js/Components/NavLink.vue
var _sfc_main$2 = {
	__name: "NavLink",
	__ssrInlineRender: true,
	props: {
		href: String,
		active: Boolean
	},
	setup(__props) {
		const props = __props;
		const classes = computed(() => {
			return props.active ? "inline-flex items-center px-1 pt-1 border-b-2 border-indigo-400 dark:border-indigo-600 text-sm font-medium leading-5 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-700 transition duration-150 ease-in-out" : "inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 focus:outline-none focus:text-gray-700 dark:focus:text-gray-300 focus:border-gray-300 dark:focus:border-gray-700 transition duration-150 ease-in-out";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Link), mergeProps({
				href: __props.href,
				class: classes.value
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
};
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/NavLink.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
// resources/js/Components/ResponsiveNavLink.vue
var _sfc_main$1 = {
	__name: "ResponsiveNavLink",
	__ssrInlineRender: true,
	props: {
		active: Boolean,
		href: String,
		as: String
	},
	setup(__props) {
		const props = __props;
		const classes = computed(() => {
			return props.active ? "block w-full ps-3 pe-4 py-2 border-l-4 border-indigo-400 dark:border-indigo-600 text-start text-base font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 focus:outline-none focus:text-indigo-800 dark:focus:text-indigo-200 focus:bg-indigo-100 dark:focus:bg-indigo-900 focus:border-indigo-700 dark:focus:border-indigo-300 transition duration-150 ease-in-out" : "block w-full ps-3 pe-4 py-2 border-l-4 border-transparent text-start text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:text-gray-800 dark:focus:text-gray-200 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-600 transition duration-150 ease-in-out";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)}>`);
			if (__props.as == "button") {
				_push(`<button class="${ssrRenderClass([classes.value, "w-full text-start"])}">`);
				ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
				_push(`</button>`);
			} else if (__props.as == "a") {
				_push(`<a class="${ssrRenderClass([classes.value, "w-full text-start"])}"${ssrRenderAttr("href", __props.href)}>`);
				ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
				_push(`</a>`);
			} else _push(ssrRenderComponent(unref(Link), {
				href: __props.href,
				class: classes.value
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
			_push(`</div>`);
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/ResponsiveNavLink.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
// resources/js/Layouts/AppLayout.vue
var _sfc_main = {
	__name: "AppLayout",
	__ssrInlineRender: true,
	props: { title: String },
	setup(__props) {
		const showingNavigationDropdown = ref(false);
		const switchToTeam = (team) => {
			router.put(route("current-team.update"), { team_id: team.id }, { preserveState: false });
		};
		const logout = () => {
			router.post(route("logout"));
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)}>`);
			_push(ssrRenderComponent(unref(Head), { title: __props.title }, null, _parent));
			_push(ssrRenderComponent(_sfc_main$5, null, null, _parent));
			_push(`<div class="min-h-screen bg-gray-100 dark:bg-gray-900"><nav class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between h-16"><div class="flex"><div class="shrink-0 flex items-center">`);
			_push(ssrRenderComponent(unref(Link), { href: _ctx.route("dashboard") }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(ApplicationMark_default, { class: "block h-9 w-auto" }, null, _parent, _scopeId));
					else return [createVNode(ApplicationMark_default, { class: "block h-9 w-auto" })];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">`);
			_push(ssrRenderComponent(_sfc_main$2, {
				href: _ctx.route("dashboard"),
				active: _ctx.route().current("dashboard")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` Create `);
					else return [createTextVNode(" Create ")];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				href: _ctx.route("generations.index"),
				active: _ctx.route().current("generations.*")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` Your generations `);
					else return [createTextVNode(" Your generations ")];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				href: _ctx.route("admin.pixelforge.usage"),
				active: _ctx.route().current("admin.pixelforge.*")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` Usage report `);
					else return [createTextVNode(" Usage report ")];
				}),
				_: 1
			}, _parent));
			_push(`</div></div><div class="hidden sm:flex sm:items-center sm:ms-6"><div class="ms-3 relative">`);
			if (_ctx.$page.props.jetstream.hasTeamFeatures) _push(ssrRenderComponent(_sfc_main$4, {
				align: "right",
				width: "60"
			}, {
				trigger: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="inline-flex rounded-md"${_scopeId}><button type="button" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition ease-in-out duration-150"${_scopeId}>${ssrInterpolate(_ctx.$page.props.auth.user.current_team.name)} <svg class="ms-2 -me-0.5 size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"${_scopeId}></path></svg></button></span>`);
					else return [createVNode("span", { class: "inline-flex rounded-md" }, [createVNode("button", {
						type: "button",
						class: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition ease-in-out duration-150"
					}, [createTextVNode(toDisplayString(_ctx.$page.props.auth.user.current_team.name) + " ", 1), (openBlock(), createBlock("svg", {
						class: "ms-2 -me-0.5 size-4",
						xmlns: "http://www.w3.org/2000/svg",
						fill: "none",
						viewBox: "0 0 24 24",
						"stroke-width": "1.5",
						stroke: "currentColor"
					}, [createVNode("path", {
						"stroke-linecap": "round",
						"stroke-linejoin": "round",
						d: "M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
					})]))])])];
				}),
				content: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="w-60"${_scopeId}><div class="block px-4 py-2 text-xs text-gray-400"${_scopeId}> Manage Team </div>`);
						_push(ssrRenderComponent(_sfc_main$3, { href: _ctx.route("teams.show", _ctx.$page.props.auth.user.current_team) }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Team Settings `);
								else return [createTextVNode(" Team Settings ")];
							}),
							_: 1
						}, _parent, _scopeId));
						if (_ctx.$page.props.jetstream.canCreateTeams) _push(ssrRenderComponent(_sfc_main$3, { href: _ctx.route("teams.create") }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Create New Team `);
								else return [createTextVNode(" Create New Team ")];
							}),
							_: 1
						}, _parent, _scopeId));
						else _push(`<!---->`);
						if (_ctx.$page.props.auth.user.all_teams.length > 1) {
							_push(`<!--[--><div class="border-t border-gray-200 dark:border-gray-600"${_scopeId}></div><div class="block px-4 py-2 text-xs text-gray-400"${_scopeId}> Switch Teams </div><!--[-->`);
							ssrRenderList(_ctx.$page.props.auth.user.all_teams, (team) => {
								_push(`<form${_scopeId}>`);
								_push(ssrRenderComponent(_sfc_main$3, { as: "button" }, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) {
											_push(`<div class="flex items-center"${_scopeId}>`);
											if (team.id == _ctx.$page.props.auth.user.current_team_id) _push(`<svg class="me-2 size-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"${_scopeId}></path></svg>`);
											else _push(`<!---->`);
											_push(`<div${_scopeId}>${ssrInterpolate(team.name)}</div></div>`);
										} else return [createVNode("div", { class: "flex items-center" }, [team.id == _ctx.$page.props.auth.user.current_team_id ? (openBlock(), createBlock("svg", {
											key: 0,
											class: "me-2 size-5 text-green-400",
											xmlns: "http://www.w3.org/2000/svg",
											fill: "none",
											viewBox: "0 0 24 24",
											"stroke-width": "1.5",
											stroke: "currentColor"
										}, [createVNode("path", {
											"stroke-linecap": "round",
											"stroke-linejoin": "round",
											d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										})])) : createCommentVNode("", true), createVNode("div", null, toDisplayString(team.name), 1)])];
									}),
									_: 2
								}, _parent, _scopeId));
								_push(`</form>`);
							});
							_push(`<!--]--><!--]-->`);
						} else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "w-60" }, [
						createVNode("div", { class: "block px-4 py-2 text-xs text-gray-400" }, " Manage Team "),
						createVNode(_sfc_main$3, { href: _ctx.route("teams.show", _ctx.$page.props.auth.user.current_team) }, {
							default: withCtx(() => [createTextVNode(" Team Settings ")]),
							_: 1
						}, 8, ["href"]),
						_ctx.$page.props.jetstream.canCreateTeams ? (openBlock(), createBlock(_sfc_main$3, {
							key: 0,
							href: _ctx.route("teams.create")
						}, {
							default: withCtx(() => [createTextVNode(" Create New Team ")]),
							_: 1
						}, 8, ["href"])) : createCommentVNode("", true),
						_ctx.$page.props.auth.user.all_teams.length > 1 ? (openBlock(), createBlock(Fragment, { key: 1 }, [
							createVNode("div", { class: "border-t border-gray-200 dark:border-gray-600" }),
							createVNode("div", { class: "block px-4 py-2 text-xs text-gray-400" }, " Switch Teams "),
							(openBlock(true), createBlock(Fragment, null, renderList(_ctx.$page.props.auth.user.all_teams, (team) => {
								return openBlock(), createBlock("form", {
									key: team.id,
									onSubmit: withModifiers(($event) => switchToTeam(team), ["prevent"])
								}, [createVNode(_sfc_main$3, { as: "button" }, {
									default: withCtx(() => [createVNode("div", { class: "flex items-center" }, [team.id == _ctx.$page.props.auth.user.current_team_id ? (openBlock(), createBlock("svg", {
										key: 0,
										class: "me-2 size-5 text-green-400",
										xmlns: "http://www.w3.org/2000/svg",
										fill: "none",
										viewBox: "0 0 24 24",
										"stroke-width": "1.5",
										stroke: "currentColor"
									}, [createVNode("path", {
										"stroke-linecap": "round",
										"stroke-linejoin": "round",
										d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									})])) : createCommentVNode("", true), createVNode("div", null, toDisplayString(team.name), 1)])]),
									_: 2
								}, 1024)], 40, ["onSubmit"]);
							}), 128))
						], 64)) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
			_push(`</div><div class="ms-3 relative">`);
			_push(ssrRenderComponent(_sfc_main$4, {
				align: "right",
				width: "48"
			}, {
				trigger: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (_ctx.$page.props.jetstream.managesProfilePhotos) _push(`<button class="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition"${_scopeId}><img class="size-8 rounded-full object-cover"${ssrRenderAttr("src", _ctx.$page.props.auth.user.profile_photo_url)}${ssrRenderAttr("alt", _ctx.$page.props.auth.user.name)}${_scopeId}></button>`);
						else _push(`<span class="inline-flex rounded-md"${_scopeId}><button type="button" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition ease-in-out duration-150"${_scopeId}>${ssrInterpolate(_ctx.$page.props.auth.user.name)} <svg class="ms-2 -me-0.5 size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"${_scopeId}></path></svg></button></span>`);
					} else return [_ctx.$page.props.jetstream.managesProfilePhotos ? (openBlock(), createBlock("button", {
						key: 0,
						class: "flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition"
					}, [createVNode("img", {
						class: "size-8 rounded-full object-cover",
						src: _ctx.$page.props.auth.user.profile_photo_url,
						alt: _ctx.$page.props.auth.user.name
					}, null, 8, ["src", "alt"])])) : (openBlock(), createBlock("span", {
						key: 1,
						class: "inline-flex rounded-md"
					}, [createVNode("button", {
						type: "button",
						class: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition ease-in-out duration-150"
					}, [createTextVNode(toDisplayString(_ctx.$page.props.auth.user.name) + " ", 1), (openBlock(), createBlock("svg", {
						class: "ms-2 -me-0.5 size-4",
						xmlns: "http://www.w3.org/2000/svg",
						fill: "none",
						viewBox: "0 0 24 24",
						"stroke-width": "1.5",
						stroke: "currentColor"
					}, [createVNode("path", {
						"stroke-linecap": "round",
						"stroke-linejoin": "round",
						d: "M19.5 8.25l-7.5 7.5-7.5-7.5"
					})]))])]))];
				}),
				content: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="block px-4 py-2 text-xs text-gray-400"${_scopeId}> Manage Account </div>`);
						_push(ssrRenderComponent(_sfc_main$3, { href: _ctx.route("profile.show") }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Profile `);
								else return [createTextVNode(" Profile ")];
							}),
							_: 1
						}, _parent, _scopeId));
						if (_ctx.$page.props.jetstream.hasApiFeatures) _push(ssrRenderComponent(_sfc_main$3, { href: _ctx.route("api-tokens.index") }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` API Tokens `);
								else return [createTextVNode(" API Tokens ")];
							}),
							_: 1
						}, _parent, _scopeId));
						else _push(`<!---->`);
						_push(`<div class="border-t border-gray-200 dark:border-gray-600"${_scopeId}></div><form${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$3, { as: "button" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Log Out `);
								else return [createTextVNode(" Log Out ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</form>`);
					} else return [
						createVNode("div", { class: "block px-4 py-2 text-xs text-gray-400" }, " Manage Account "),
						createVNode(_sfc_main$3, { href: _ctx.route("profile.show") }, {
							default: withCtx(() => [createTextVNode(" Profile ")]),
							_: 1
						}, 8, ["href"]),
						_ctx.$page.props.jetstream.hasApiFeatures ? (openBlock(), createBlock(_sfc_main$3, {
							key: 0,
							href: _ctx.route("api-tokens.index")
						}, {
							default: withCtx(() => [createTextVNode(" API Tokens ")]),
							_: 1
						}, 8, ["href"])) : createCommentVNode("", true),
						createVNode("div", { class: "border-t border-gray-200 dark:border-gray-600" }),
						createVNode("form", { onSubmit: withModifiers(logout, ["prevent"]) }, [createVNode(_sfc_main$3, { as: "button" }, {
							default: withCtx(() => [createTextVNode(" Log Out ")]),
							_: 1
						})], 32)
					];
				}),
				_: 1
			}, _parent));
			_push(`</div></div><div class="-me-2 flex items-center sm:hidden"><button class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400 transition duration-150 ease-in-out"><svg class="size-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path class="${ssrRenderClass({
				hidden: showingNavigationDropdown.value,
				"inline-flex": !showingNavigationDropdown.value
			})}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path><path class="${ssrRenderClass({
				hidden: !showingNavigationDropdown.value,
				"inline-flex": showingNavigationDropdown.value
			})}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div></div><div class="${ssrRenderClass([{
				block: showingNavigationDropdown.value,
				hidden: !showingNavigationDropdown.value
			}, "sm:hidden"])}"><div class="pt-2 pb-3 space-y-1">`);
			_push(ssrRenderComponent(_sfc_main$1, {
				href: _ctx.route("dashboard"),
				active: _ctx.route().current("dashboard")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` Create `);
					else return [createTextVNode(" Create ")];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_sfc_main$1, {
				href: _ctx.route("generations.index"),
				active: _ctx.route().current("generations.*")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` Your generations `);
					else return [createTextVNode(" Your generations ")];
				}),
				_: 1
			}, _parent));
			if (_ctx.$page.props.canViewPixelforgeReport) _push(ssrRenderComponent(_sfc_main$1, {
				href: _ctx.route("admin.pixelforge.usage"),
				active: _ctx.route().current("admin.pixelforge.*")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` Usage report `);
					else return [createTextVNode(" Usage report ")];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
			_push(`</div><div class="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600"><div class="flex items-center px-4">`);
			if (_ctx.$page.props.jetstream.managesProfilePhotos) _push(`<div class="shrink-0 me-3"><img class="size-10 rounded-full object-cover"${ssrRenderAttr("src", _ctx.$page.props.auth.user.profile_photo_url)}${ssrRenderAttr("alt", _ctx.$page.props.auth.user.name)}></div>`);
			else _push(`<!---->`);
			_push(`<div><div class="font-medium text-base text-gray-800 dark:text-gray-200">${ssrInterpolate(_ctx.$page.props.auth.user.name)}</div><div class="font-medium text-sm text-gray-500">${ssrInterpolate(_ctx.$page.props.auth.user.email)}</div></div></div><div class="mt-3 space-y-1">`);
			_push(ssrRenderComponent(_sfc_main$1, {
				href: _ctx.route("profile.show"),
				active: _ctx.route().current("profile.show")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` Profile `);
					else return [createTextVNode(" Profile ")];
				}),
				_: 1
			}, _parent));
			if (_ctx.$page.props.jetstream.hasApiFeatures) _push(ssrRenderComponent(_sfc_main$1, {
				href: _ctx.route("api-tokens.index"),
				active: _ctx.route().current("api-tokens.index")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` API Tokens `);
					else return [createTextVNode(" API Tokens ")];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
			_push(`<form method="POST">`);
			_push(ssrRenderComponent(_sfc_main$1, { as: "button" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(` Log Out `);
					else return [createTextVNode(" Log Out ")];
				}),
				_: 1
			}, _parent));
			_push(`</form>`);
			if (_ctx.$page.props.jetstream.hasTeamFeatures) {
				_push(`<!--[--><div class="border-t border-gray-200 dark:border-gray-600"></div><div class="block px-4 py-2 text-xs text-gray-400"> Manage Team </div>`);
				_push(ssrRenderComponent(_sfc_main$1, {
					href: _ctx.route("teams.show", _ctx.$page.props.auth.user.current_team),
					active: _ctx.route().current("teams.show")
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(` Team Settings `);
						else return [createTextVNode(" Team Settings ")];
					}),
					_: 1
				}, _parent));
				if (_ctx.$page.props.jetstream.canCreateTeams) _push(ssrRenderComponent(_sfc_main$1, {
					href: _ctx.route("teams.create"),
					active: _ctx.route().current("teams.create")
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(` Create New Team `);
						else return [createTextVNode(" Create New Team ")];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				if (_ctx.$page.props.auth.user.all_teams.length > 1) {
					_push(`<!--[--><div class="border-t border-gray-200 dark:border-gray-600"></div><div class="block px-4 py-2 text-xs text-gray-400"> Switch Teams </div><!--[-->`);
					ssrRenderList(_ctx.$page.props.auth.user.all_teams, (team) => {
						_push(`<form>`);
						_push(ssrRenderComponent(_sfc_main$1, { as: "button" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<div class="flex items-center"${_scopeId}>`);
									if (team.id == _ctx.$page.props.auth.user.current_team_id) _push(`<svg class="me-2 size-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"${_scopeId}></path></svg>`);
									else _push(`<!---->`);
									_push(`<div${_scopeId}>${ssrInterpolate(team.name)}</div></div>`);
								} else return [createVNode("div", { class: "flex items-center" }, [team.id == _ctx.$page.props.auth.user.current_team_id ? (openBlock(), createBlock("svg", {
									key: 0,
									class: "me-2 size-5 text-green-400",
									xmlns: "http://www.w3.org/2000/svg",
									fill: "none",
									viewBox: "0 0 24 24",
									"stroke-width": "1.5",
									stroke: "currentColor"
								}, [createVNode("path", {
									"stroke-linecap": "round",
									"stroke-linejoin": "round",
									d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								})])) : createCommentVNode("", true), createVNode("div", null, toDisplayString(team.name), 1)])];
							}),
							_: 2
						}, _parent));
						_push(`</form>`);
					});
					_push(`<!--]--><!--]-->`);
				} else _push(`<!---->`);
				_push(`<!--]-->`);
			} else _push(`<!---->`);
			_push(`</div></div></div></nav>`);
			if (_ctx.$slots.header) {
				_push(`<header class="bg-white dark:bg-gray-800 shadow"><div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">`);
				ssrRenderSlot(_ctx.$slots, "header", {}, null, _push, _parent);
				_push(`</div></header>`);
			} else _push(`<!---->`);
			_push(`<main>`);
			if (_ctx.$page.props.flash?.success || _ctx.$page.props.flash?.error || _ctx.$page.props.flash?.warning) {
				_push(`<div class="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">`);
				if (_ctx.$page.props.flash.success) _push(`<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">${ssrInterpolate(_ctx.$page.props.flash.success)}</div>`);
				else if (_ctx.$page.props.flash.error) _push(`<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">${ssrInterpolate(_ctx.$page.props.flash.error)}</div>`);
				else _push(`<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">${ssrInterpolate(_ctx.$page.props.flash.warning)}</div>`);
				_push(`</div>`);
			} else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</main></div></div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/AppLayout.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export { _sfc_main as t };
