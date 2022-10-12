const publicPropsMap = {
  $el: (i) => i.vnode.el,
};

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }
    const getInstanceProp = publicPropsMap[key];

    if (getInstanceProp) return getInstanceProp(instance);
  },
};
