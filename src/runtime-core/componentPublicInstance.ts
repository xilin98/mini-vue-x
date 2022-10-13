const publicPropsMap = {
  $el: (i) => i.vnode.el,
};

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const getInstanceProp = publicPropsMap[key];

    if (getInstanceProp) return getInstanceProp(instance);
    const { setupState, props } = instance;
    if (hasKey(setupState, key)) {
      return setupState[key];
    }
    if (hasKey(props, key)) {
      return props[key];
    }
  },
};
function hasKey(target: any, key: any) {
  return Object.prototype.hasOwnProperty.call(target, key);
}
