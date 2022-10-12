import { isObject } from "../utils";
import { createComponentInstance, setupComponent } from "./component";
import { createVnode } from "./vnode";

export function render(vnode, container) {
  // call patch here
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  console.log(vnode.type);
  // processComponent(vnode, container);
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
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
  const { children } = vnode;
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }
  const { props } = vnode;
  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  container.append(el);
}

function mountChildren(children: any[], container: any) {
  children.forEach((vnode) => {
    patch(vnode, container);
  });
}