import { SHAPEFLAG } from "../ShapeFlag";

export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    vnode: null,
    shapeFlag: getShapeFlag(type),
  };

  if (typeof children === "string") {
    vnode.shapeFlag |= SHAPEFLAG.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= SHAPEFLAG.ARRAY_CHILDREN;
  } else if (typeof children === "object") {
    vnode.shapeFlag |= SHAPEFLAG.SLOTS_CHILDREN;
  }
  return vnode;
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? SHAPEFLAG.ELEMENT
    : SHAPEFLAG.STATEFUL_COMPONENT;
}
