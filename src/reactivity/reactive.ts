import { isObject } from "../utils";
import { READONLY_FLAG, REACTIVE_FLAG } from "./const";
import { track, trigger } from "./effect";

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      let res = Reflect.get(target, key);
      if (isObject(res)) res = reactive(res);
      if (key === REACTIVE_FLAG) return true;
      // TODO  依赖收集
      track(target, key);
      return res;
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value);

      // TODO 触发依赖
      trigger(target, key);
      return res;
    },
  });
}
const readonlyHandlers = {
  get(target, key) {
    if (key === READONLY_FLAG) return true;
    let res = Reflect.get(target, key);
    if (isObject(res)) res = readonly(res);
    return res;
  },

  set(): boolean {
    console.warn();
    return false;
  },
};

export function readonly(raw) {
  return new Proxy(raw, readonlyHandlers);
}

const shallowReadonlyHandlers = Object.assign(readonlyHandlers, {
  get(target, key) {
    if (key === READONLY_FLAG) return true;
    let res = Reflect.get(target, key);
    return res;
  },
});

export function shallowReadonly(raw) {
  return new Proxy(raw, shallowReadonlyHandlers);
}

export function isReactive(obj) {
  return !!obj[REACTIVE_FLAG];
}

export function isReadonly(obj) {
  return !!obj[READONLY_FLAG];
}

export function isProxy(target) {
  return isReadonly(target) || isReactive(target);
}
