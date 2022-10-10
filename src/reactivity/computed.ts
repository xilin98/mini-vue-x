import { reactiveEffective } from "./effect";
export function computed(getter) {
  return new ComputedRefs(getter);
}

class ComputedRefs {
  private _cache: any;
  private _dirty: boolean = true;
  private _effect: reactiveEffective;

  constructor(getter) {
    this._effect = new reactiveEffective(getter);
    Object.assign(this._effect, {
      scheduler: () => {
        this._dirty = true;
      },
    });
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      return (this._cache = this._effect.run());
    }
    return this._cache;
  }
}
