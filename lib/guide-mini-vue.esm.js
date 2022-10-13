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
        if (key === "onClick") {
            el.addEventListener("click", props[key]);
        }
        else {
            el.setAttribute(key, props[key]);
        }
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

export { createApp, h };
