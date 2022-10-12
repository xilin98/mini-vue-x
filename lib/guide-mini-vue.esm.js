function isObject(value) {
    return typeof value === "object" && value !== null;
}

const publicPropsMap = {
    $el: (i) => i.vnode.el,
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const getInstanceProp = publicPropsMap[key];
        if (getInstanceProp)
            return getInstanceProp(instance);
    },
};

function createComponentInstance(vnode) {
    const instance = { vnode, type: vnode.type, setState: {} };
    return instance;
}
function setupComponent(instance) {
    // initProps
    // initSlots
    setStatefulComponent(instance);
}
function setStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupReasult = setup();
        handleSetupResult(instance, setupReasult);
    }
    instance.setupState;
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
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
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
    const { children } = vnode;
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    const { props } = vnode;
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    container.append(el);
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
    };
    return vnode;
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

export { createApp, h };
