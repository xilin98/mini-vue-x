import { publicInstanceProxyHandlers } from "./componentPublicInstance";
export function createComponentInstance(vnode) {
  const instance = { vnode, type: vnode.type, setState: {} };
  return instance;
}

export function setupComponent(instance: { vnode: any }) {
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
  const setupState = instance.setupState;
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
}

function handleSetupResult(instance, setupReasult: any) {
  if (typeof setupReasult === "object") {
    instance.setupState = setupReasult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const component = instance.type;
  if (component.render) {
    instance.render = component.render;
  }
}
