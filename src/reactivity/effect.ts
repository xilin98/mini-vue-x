class reactiveEffective {
  _fn: any;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    this._fn();
  }
}

const effectMap = new Map();
export function track(target, key) {
  let targetMap = effectMap.get(target);
  if (!targetMap) {
    targetMap = new Map();
    effectMap.set(target, targetMap);
  }
  let deps = targetMap.get(key);
  if (!deps) {
    deps = new Set();
    targetMap.set(key, deps);
  }
  deps.add(activeEffect);
}

export function trigger(target, key) {
  let deps = effectMap.get(target).get(key);
  for (let effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect._fn();
    }
  }
}
let activeEffect;
export function effect(fn, option?) {
  // const _effect = option
  //   ? new reactiveEffective(fn, option.scheduler)
  //   : new reactiveEffective(fn);
  const _effect = new reactiveEffective(fn, option?.scheduler);
  _effect.run();
  return _effect._fn.bind(_effect);
}
