import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
export function createComponentInstance(vnode) {
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

export function setupComponent(instance: { vnode: any }) {
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
