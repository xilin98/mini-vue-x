export function createComponentInstance(vnode) {
  const instance = { vnode, type: vnode.type };
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
