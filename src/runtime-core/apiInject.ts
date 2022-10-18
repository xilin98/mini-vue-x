import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    const { provides } = currentInstance;
    provides[key] = value;
  }
}

export function inject(key, defaultValue) {
  const currentInsstance = getCurrentInstance();
  if (currentInsstance) {
    const { provides } = currentInsstance;
    return (
      provides[key] ||
      (typeof defaultValue === "function" ? defaultValue() : defaultValue)
    );
  }
}
