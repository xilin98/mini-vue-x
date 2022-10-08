let activeEffect;
const effectMap = new Map();

class reactiveEffective {
  _fn: any;
  deps = [];
  active = true;
  onStop?: () => {};

  constructor(fn) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    return this._fn();
  }

  stop() {
    cleanEffect(this);
  }
}

function cleanEffect(effect) {
  if (effect.onStop) {
    effect.onStop();
  }

  if (effect.active) {
    effect.deps.forEach((dep: any) => {
      dep.delete(effect);
    });
  }
}

export function track(target, key) {
  let targetMap = effectMap.get(target);
  if (!targetMap) {
    targetMap = new Map();
    effectMap.set(target, targetMap);
  }
  let dep = targetMap.get(key);

  if (!dep) {
    dep = new Set();
    targetMap.set(key, dep);
  }

  collectEffect(dep);
}

export function collectEffect(dep: any) {
  if (activeEffect) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
    activeEffect = null;
  }
}

export function trigger(target, key) {
  let deps = effectMap.get(target).get(key);
  notifyDep(deps);
}

export function notifyDep(deps: any) {
  for (let effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect._fn();
    }
  }
}

export function effect(fn, options?) {
  let effect = new reactiveEffective(fn);
  effect = Object.assign(effect, options);
  effect.run();

  const runner: any = effect.run.bind(effect);
  runner.effect = effect;
  return runner;
}

export function stop(runner) {
  const effect = runner.effect;
  effect.stop();
}
