'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isObject(value) {
    return typeof value === "object" && value !== null;
}

const READONLY_FLAG = Symbol("readonly-flag");

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
        instance.props = rawProps;
}

const publicPropsMap = {
    $el: (i) => i.vnode.el,
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

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit,
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    // initSlots
    setStatefulComponent(instance);
}
function setStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupReasult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        handleSetupResult(instance, setupReasult);
    }
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
}
function handleSetupResult(instance, setupReasult) {
    if (typeof setupReasult === "object") {
        instance.setupState = setupReasult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}

function render(vnode, container) {
    // call patch here
    patch(vnode, container);
}
function patch(vnode, container) {
    console.log(vnode.type);
    // processComponent(vnode, container);
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* SHAPEFLAG.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* SHAPEFLAG.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container, vnode);
}
function setupRenderEffect(instance, container, vnode) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    let el = (vnode.el = document.createElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* SHAPEFLAG.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* SHAPEFLAG.ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    const { props } = vnode;
    for (const key in props) {
        if (isEvent(key)) {
            el.addEventListener(key.slice(2).toLowerCase(), props[key]);
        }
        else {
            el.setAttribute(key, props[key]);
        }
    }
    container.append(el);
}
function isEvent(key) {
    return /^on[A-Z]/.test(key);
}
function mountChildren(children, container) {
    children.forEach((vnode) => {
        patch(vnode, container);
    });
}

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
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* SHAPEFLAG.ELEMENT */
        : 2 /* SHAPEFLAG.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(selector) {
            // create vnode first
            const rootContainer = document.querySelector(selector);
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
