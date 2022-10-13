import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
export function createComponentInstance(vnode) {
  const instance = { vnode, type: vnode.type, setupState: {}, props: {} };
  return instance;
}

export function setupComponent(instance: { vnode: any }) {
  initProps(instance, instance.vnode.props);
  // initSlots
  setStatefulComponent(instance);
}

function setStatefulComponent(instance) {
  const component = instance.type;
  const { setup } = component;
  if (setup) {
    const setupReasult = setup(shallowReadonly(instance.props));
    handleSetupResult(instance, setupReasult);
  }
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
