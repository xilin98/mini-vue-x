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
    if (isObject(this._value)) return this._value;
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
