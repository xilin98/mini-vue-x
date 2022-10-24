import { createRenderer } from "../runtime-core";

function createElement(tag) {
  console.log("createElement-------------");
  return document.createElement(tag);
}

function patchProp(el, key, preVal, newVal) {
  console.log("patchProp-----------");
  if (isEvent(key)) {
    el.addEventListener(key.slice(2).toLowerCase(), newVal);
    return;
  }

  if (newVal === undefined || newVal === null) {
    el.removeAttribute(key);
    return;
  }
  el.setAttribute(key, newVal);
}

function insert(el, container) {
  console.log("insert-------------");
  container.append(el);
}

function isEvent(key) {
  return /^on[A-Z]/.test(key);
}

function remove(el) {
  return el.remove();
}

function setElementText(text, el) {
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...arg) {
  const rootObj = renderer.createApp(...arg);
  const { mount: originMount } = rootObj;
  function DomMout(selector) {
    const rootComponent = document.querySelector(selector);
    originMount(rootComponent);
  }

  rootObj.mount = DomMout;
  return rootObj;
}
export * from "../runtime-core/index";
