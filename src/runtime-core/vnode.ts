export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    vnode: null,
  };
  return vnode;
}
