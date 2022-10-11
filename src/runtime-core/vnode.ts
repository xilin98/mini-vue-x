export function createVnode(type, prop?, children?) {
  const vnode = {
    type,
    prop,
    children,
  };
  return vnode;
}
