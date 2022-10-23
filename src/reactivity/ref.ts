import { isObject } from "../utils";
import { collectEffect, notifyDep } from "./effect";
import { reactive } from "./reactive";

const REF_FLAG = Symbol("ref");
class RefImpl {
  _value;
  dep;
  raw;
  [REF_FLAG] = true;
  constructor(value) {
    this.raw = value;
    this._value = isObject(value) ? reactive(value) : value;
    this.dep = new Set();
  }

  get value() {
    if (isObject(this._value)) {
      collectEffect(this.dep, false);
      return this._value;
    }
    collectEffect(this.dep);
    return this._value;
  }

  set value(newValue) {
    if (newValue === this.raw) return;
    this._value = isObject(newValue) ? reactive(newValue) : newValue;
    notifyDep(this.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(value) {
  return !!value[REF_FLAG];
}

export function unRef(maybeRef) {
  if (isRef(maybeRef)) {
    return maybeRef.value;
  }
  return maybeRef;
}

const proxyRefsHandler = {
  get(target, key) {
    const original = Reflect.get(target, key);
    return unRef(original);
  },
  set(target, key, value) {
    if (isRef(value)) {
      Reflect.set(target, key, value);
      return true;
    }
    const orginal = Reflect.get(target, key);
    if (isRef(orginal)) {
      orginal.value = value;
      return true;
    }
    Reflect.set(target, key, value);
    return true;
  },
};

export function proxyRefs(obj) {
  return new Proxy(obj, proxyRefsHandler);
}
