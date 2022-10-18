import { render } from "./render";
import { createVnode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(selector) {
      // create vnode first
      const rootContainer = document.querySelector(selector);
      const vnode = createVnode(rootComponent);
      render(vnode, rootContainer, {});
    },
  };
}
