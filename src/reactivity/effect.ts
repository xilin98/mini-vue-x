class reactiveEffective {
  _fn: any;
  constructor(fn) {
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
    effect._fn();
  }
}
let activeEffect;
export function effect(fn) {
  const _effect = new reactiveEffective(fn);
  _effect.run();
}
