import { SHAPEFLAG } from "../ShapeFlag";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // call patch here
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  // processComponent(vnode, container);
  const { shapeFlag } = vnode;
  if (shapeFlag & SHAPEFLAG.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & SHAPEFLAG.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}

function processComponent(vnode: any, container) {
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container, vnode);
}

function setupRenderEffect(instance, container, vnode) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  vnode.el = subTree.el;
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  let el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;
  if (shapeFlag & SHAPEFLAG.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & SHAPEFLAG.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }
  const { props } = vnode;
  for (const key in props) {
    if (isEvent(key)) {
      el.addEventListener(key.slice(2).toLowerCase(), props[key]);
    } else {
      el.setAttribute(key, props[key]);
    }
  }
  container.append(el);
}

function isEvent(key) {
  return /^on[A-Z]/.test(key);
}

function mountChildren(children: any[], container: any) {
  children.forEach((vnode) => {
    patch(vnode, container);
  });
}
