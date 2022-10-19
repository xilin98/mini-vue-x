import { createVnode } from "./vnode";

export function createAppApi(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // create vnode first
        const vnode = createVnode(rootComponent);
        render(vnode, rootContainer, {});
      },
    };
  };
}
