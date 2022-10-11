import { createVnode } from "./vnode";

export function h(type, prop?, children?) {
  return createVnode(type, prop, children);
}
