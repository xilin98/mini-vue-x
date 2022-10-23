function isObject(value) {
    return typeof value === "object" && value !== null;
}

let activeEffect;
const effectMap = new Map();
class reactiveEffective {
    constructor(fn) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        activeEffect = this;
        return this._fn();
    }
    stop() {
        cleanEffect(this);
    }
}
function cleanEffect(effect) {
    if (effect.onStop) {
        effect.onStop();
    }
    if (effect.active) {
        effect.deps.forEach((dep) => {
            dep.delete(effect);
        });
    }
}
function track(target, key) {
    let targetMap = effectMap.get(target);
    if (!targetMap) {
        targetMap = new Map();
        effectMap.set(target, targetMap);
    }
    let dep = targetMap.get(key);
    if (!dep) {
        dep = new Set();
        targetMap.set(key, dep);
    }
    collectEffect(dep);
}
function collectEffect(dep, clear = true) {
    if (activeEffect) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
        if (clear)
            activeEffect = null;
    }
}
function trigger(target, key) {
    let deps = effectMap.get(target).get(key);
    notifyDep(deps);
}
function notifyDep(deps) {
    for (let effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect._fn();
        }
    }
}
function effect(fn, options) {
    let effect = new reactiveEffective(fn);
    effect = Object.assign(effect, options);
    effect.run();
    const runner = effect.run.bind(effect);
    runner.effect = effect;
    return runner;
}

const REACTIVE_FLAG = Symbol("reactive-flag");
const READONLY_FLAG = Symbol("readonly-flag");

function reactive(raw) {
    return new Proxy(raw, {
        get(target, key) {
            let res = Reflect.get(target, key);
            if (isObject(res))
                res = reactive(res);
            if (key === REACTIVE_FLAG)
                return true;
            // TODO  依赖收集
            track(target, key);
            return res;
        },
        set(target, key, value) {
            const res = Reflect.set(target, key, value);
            // TODO 触发依赖
            trigger(target, key);
            return res;
        },
    });
}
const readonlyHandlers = {
    get(target, key) {
        if (key === READONLY_FLAG)
            return true;
        let res = Reflect.get(target, key);
        if (isObject(res))
            res = readonly(res);
        return res;
    },
    set() {
        console.warn();
        return false;
    },
};
function readonly(raw) {
    return new Proxy(raw, readonlyHandlers);
}
const shallowReadonlyHandlers = Object.assign(readonlyHandlers, {
    get(target, key) {
        if (key === READONLY_FLAG)
            return true;
        let res = Reflect.get(target, key);
        return res;
    },
});
function shallowReadonly(raw) {
    return new Proxy(raw, shallowReadonlyHandlers);
}

var _a;
const REF_FLAG = Symbol("ref");
class RefImpl {
    constructor(value) {
        this[_a] = true;
        this.raw = value;
        this._value = isObject(value) ? reactive(value) : value;
        this.dep = new Set();
    }
    get value() {
        if (isObject(this._value)) {
            collectEffect(this.dep, false);
            return this._value;
        }
        collectEffect(this.dep);
        return this._value;
    }
    set value(newValue) {
        if (newValue === this.raw)
            return;
        this._value = isObject(newValue) ? reactive(newValue) : newValue;
        notifyDep(this.dep);
    }
}
_a = REF_FLAG;
function ref(value) {
    return new RefImpl(value);
}
function isRef(value) {
    return !!value[REF_FLAG];
}
function unRef(maybeRef) {
    if (isRef(maybeRef)) {
        return maybeRef.value;
    }
    return maybeRef;
}
const proxyRefsHandler = {
    get(target, key) {
        const original = Reflect.get(target, key);
        return unRef(original);
    },
    set(target, key, value) {
        if (isRef(value)) {
            Reflect.set(target, key, value);
            return true;
        }
        const orginal = Reflect.get(target, key);
        if (isRef(orginal)) {
            orginal.value = value;
            return true;
        }
        Reflect.set(target, key, value);
        return true;
    },
};
function proxyRefs(obj) {
    return new Proxy(obj, proxyRefsHandler);
}

function emit(instance, event, ...arg) {
    const { props } = instance;
    event = kebabToCamel(event);
    const handler = props["on" + event.charAt(0).toUpperCase() + event.slice(1)];
    if (handler)
        handler(...arg);
}
function kebabToCamel(str) {
    return str.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}

function initProps(instance, rawProps) {
    if (rawProps)
        instance.props = rawProps || {};
}

const publicPropsMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const getInstanceProp = publicPropsMap[key];
        if (getInstanceProp)
            return getInstanceProp(instance);
        const { setupState, props } = instance;
        if (hasKey(setupState, key)) {
            return setupState[key];
        }
        if (hasKey(props, key)) {
            return props[key];
        }
    },
};
function hasKey(target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
}

function initSlots(instance, children) {
    instance.slots = children;
}

let currentInstance;
function createComponentInstance(vnode, parent) {
    console.log("currenInstanceParent", parent);
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        subTree: {},
        props: {},
        slots: {},
        parent,
        provides: null,
        emit,
        isMount: false,
    };
    instance.emit = emit.bind(null, instance);
    instance.provides = Object.create(parent.provides || null);
    return instance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setStatefulComponent(instance);
}
function setStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupReasult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        handleSetupResult(instance, setupReasult);
    }
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
}
function handleSetupResult(instance, setupReasult) {
    if (typeof setupReasult === "object") {
        instance.setupState = proxyRefs(setupReasult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const FRAGMENT_FLAG = Symbol("fragment");
const TEXT_FLAG = Symbol("text");

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        vnode: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* SHAPEFLAG.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* SHAPEFLAG.ARRAY_CHILDREN */;
    }
    else if (typeof children === "object") {
        vnode.shapeFlag |= 16 /* SHAPEFLAG.SLOTS_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* SHAPEFLAG.ELEMENT */
        : 2 /* SHAPEFLAG.STATEFUL_COMPONENT */;
}
function createTextVnode(text) {
    return createVnode(TEXT_FLAG, {}, text);
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // create vnode first
                const vnode = createVnode(rootComponent);
                render(vnode, rootContainer, {});
            },
        };
    };
}

function createRenderer(options) {
    const { createElement: HostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    function render(vnode, container, parent) {
        // call patch here
        patch(null, vnode, container, parent);
    }
    function patch(n1, n2, container, parent) {
        // processComponent(vnode, container);
        const { shapeFlag, type } = n2;
        if (type === FRAGMENT_FLAG) {
            processFragment(n1, n2, container, parent);
            return;
        }
        if (type === TEXT_FLAG) {
            processTextNode(n1, n2, container);
            return;
        }
        if (shapeFlag & 1 /* SHAPEFLAG.ELEMENT */) {
            processElement(n1, n2, container);
        }
        else if (shapeFlag & 2 /* SHAPEFLAG.STATEFUL_COMPONENT */) {
            processComponent(n1, n2, container, parent);
        }
    }
    function processFragment(n1, n2, container, parent) {
        mountChildren(n2.children, container, parent);
    }
    function processComponent(n1, n2, container, parent) {
        mountComponent(n2, container, parent);
    }
    function mountComponent(vnode, container, parent) {
        const instance = createComponentInstance(vnode, parent);
        setupComponent(instance);
        setupRenderEffect(instance, container, vnode);
    }
    function setupRenderEffect(instance, container, vnode) {
        effect(() => {
            if (!instance.isMount) {
                console.log("init");
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                console.log(subTree);
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMount = true;
            }
            else {
                console.log("update");
                const { proxy } = instance;
                const prevSubTree = instance.subTree;
                const subTree = (instance.subTree = instance.render.call(proxy));
                console.log("subTree", subTree);
                console.log("prevSubTree", prevSubTree);
                debugger;
                patch(prevSubTree, subTree, container, instance);
                vnode.el = subTree.el;
            }
        });
    }
    function processElement(n1, n2, container) {
        if (!n1) {
            mountElement(n2, container, parent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, contianer) {
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
    }
    function patchProps(el, oldProps, newProps) {
        for (let key in newProps) {
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if (prevProp !== nextProp) {
                hostPatchProp(el, key, prevProp, nextProp);
            }
        }
        for (const key in oldProps) {
            debugger;
            const prevProp = oldProps[key];
            if (!(key in newProps)) {
                hostPatchProp(el, key, prevProp, null);
            }
        }
    }
    function mountElement(vnode, container, parent) {
        // let el = (vnode.el = document.createElement(vnode.type));
        let el = (vnode.el = HostCreateElement(vnode.type));
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* SHAPEFLAG.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* SHAPEFLAG.ARRAY_CHILDREN */) {
            mountChildren(children, el, parent);
        }
        const { props } = vnode;
        for (const key in props) {
            // if (isEvent(key)) {
            //   el.addEventListener(key.slice(2).toLowerCase(), props[key]);
            // } else {
            //   el.setAttribute(key, props[key]);
            // }
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // container.append(el);
        hostInsert(el, container);
    }
    function mountChildren(children, container, parent) {
        children.forEach((vnode) => {
            patch(null, vnode, container, parent);
        });
    }
    function processTextNode(n1, n2, container) {
        const { children } = n2;
        let el = (n2.el = document.createTextNode(children));
        container.append(el);
    }
    return {
        createApp: createAppApi(render),
    };
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { provides } = currentInstance;
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInsstance = getCurrentInstance();
    if (currentInsstance) {
        const { provides } = currentInsstance;
        return (provides[key] ||
            (typeof defaultValue === "function" ? defaultValue() : defaultValue));
    }
}

function renderSlots(slots, name, info) {
    const slot = slots[name](info);
    if (Array.isArray(slot))
        return createVnode("fragment", {}, slot);
    return slot;
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function createElement(tag) {
    console.log("createElement-------------");
    return document.createElement(tag);
}
function patchProp(el, key, preVal, newVal) {
    console.log("patchProp-----------");
    if (isEvent(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), newVal);
        return;
    }
    if (newVal === undefined || newVal === null) {
        el.removeAttribute(key);
        return;
    }
    el.setAttribute(key, newVal);
}
function insert(el, container) {
    console.log("insert-------------");
    container.append(el);
}
function isEvent(key) {
    return /^on[A-Z]/.test(key);
}
const renderer = createRenderer({ createElement, patchProp, insert });
function createApp(...arg) {
    const rootObj = renderer.createApp(...arg);
    const { mount: originMount } = rootObj;
    function DomMout(selector) {
        const rootComponent = document.querySelector(selector);
        originMount(rootComponent);
    }
    rootObj.mount = DomMout;
    return rootObj;
}

export { createApp, createRenderer, createTextVnode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
