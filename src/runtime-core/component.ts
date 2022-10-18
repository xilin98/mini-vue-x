import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

let currentInstance;
export function createComponentInstance(vnode, parent) {
  console.log("currenInstanceParent", parent);
  const instance = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    parent,
    provides: null,
    emit,
  };
  instance.emit = emit.bind(null, instance);
  instance.provides = Object.create(parent.provides || null);
  return instance;
}

export function setupComponent(instance) {
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

export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}
