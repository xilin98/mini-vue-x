function isObject(value) {
    return typeof value === "object" && value !== null;
}

function createComponentInstance(vnode) {
    const instance = { vnode, type: vnode.type };
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
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children } = vnode;
    el.textContent = children;
    const { props } = vnode;
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    container.append(el);
}

function createVnode(type, prop, children) {
    const vnode = {
        type,
        prop,
        children,
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

function h(type, prop, children) {
    return createVnode(type, prop, children);
}

export { createApp, h };
