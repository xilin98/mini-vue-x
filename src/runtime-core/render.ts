import { isObject } from "../utils";
import { createComponentInstance, setupComponent } from "./component";

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
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  patch(subTree, container);
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  const { children } = vnode;
  el.textContent = children;
  const { props } = vnode;
  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  container.append(el);
}
