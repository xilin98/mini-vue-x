import { SHAPEFLAG } from "./const/ShapeFlag";
import { createComponentInstance, setupComponent } from "./component";
import { FRAGMENT_FLAG, TEXT_FLAG } from "./const/Symbols";
import { createAppApi } from "./createApp";

export function createRenderer(options) {
  const {
    createElement: HostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;

  function render(vnode, container, parent) {
    // call patch here
    patch(vnode, container, parent);
  }

  function patch(vnode: any, container: any, parent) {
    // processComponent(vnode, container);
    const { shapeFlag, type } = vnode;
    if (type === FRAGMENT_FLAG) {
      processFragment(vnode, container, parent);
      return;
    }
    if (type === TEXT_FLAG) {
      processTextNode(vnode, container);
      return;
    }
    if (shapeFlag & SHAPEFLAG.ELEMENT) {
      processElement(vnode, container);
    } else if (shapeFlag & SHAPEFLAG.STATEFUL_COMPONENT) {
      processComponent(vnode, container, parent);
    }
  }

  function processFragment(vnode: any, container: any, parent) {
    mountChildren(vnode.children, container, parent);
  }

  function processComponent(vnode: any, container, parent) {
    mountComponent(vnode, container, parent);
  }

  function mountComponent(vnode: any, container, parent) {
    const instance = createComponentInstance(vnode, parent);
    setupComponent(instance);
    setupRenderEffect(instance, container, vnode);
  }

  function setupRenderEffect(instance, container, vnode) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);
    vnode.el = subTree.el;
  }

  function processElement(vnode: any, container: any) {
    mountElement(vnode, container, parent);
  }

  function mountElement(vnode: any, container: any, parent) {
    // let el = (vnode.el = document.createElement(vnode.type));
    let el = (vnode.el = HostCreateElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & SHAPEFLAG.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & SHAPEFLAG.ARRAY_CHILDREN) {
      mountChildren(children, el, parent);
    }
    const { props } = vnode;
    for (const key in props) {
      // if (isEvent(key)) {
      //   el.addEventListener(key.slice(2).toLowerCase(), props[key]);
      // } else {
      //   el.setAttribute(key, props[key]);
      // }
      const val = props[key];
      hostPatchProp(el, key, val);
    }
    // container.append(el);
    hostInsert(el, container);
  }

  function mountChildren(children: any[], container: any, parent) {
    children.forEach((vnode) => {
      patch(vnode, container, parent);
    });
  }
  function processTextNode(vnode: any, container: any) {
    const { children } = vnode;
    let el = (vnode.el = document.createTextNode(children));
    container.append(el);
  }
  return {
    createApp: createAppApi(render),
  };
}
