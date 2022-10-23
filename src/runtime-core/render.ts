import { SHAPEFLAG } from "./const/ShapeFlag";
import { createComponentInstance, setupComponent } from "./component";
import { FRAGMENT_FLAG, TEXT_FLAG } from "./const/Symbols";
import { createAppApi } from "./createApp";
import { effect } from "../reactivity/effect";

export function createRenderer(options) {
  const {
    createElement: HostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;

  function render(vnode, container, parent) {
    // call patch here
    patch(null, vnode, container, parent);
  }

  function patch(n1, n2: any, container: any, parent) {
    // processComponent(vnode, container);
    const { shapeFlag, type } = n2;
    if (type === FRAGMENT_FLAG) {
      processFragment(n1, n2, container, parent);
      return;
    }
    if (type === TEXT_FLAG) {
      processTextNode(n1, n2, container);
      return;
    }
    if (shapeFlag & SHAPEFLAG.ELEMENT) {
      processElement(n1, n2, container);
    } else if (shapeFlag & SHAPEFLAG.STATEFUL_COMPONENT) {
      processComponent(n1, n2, container, parent);
    }
  }

  function processFragment(n1, n2: any, container: any, parent) {
    mountChildren(n2.children, container, parent);
  }

  function processComponent(n1, n2: any, container, parent) {
    mountComponent(n2, container, parent);
  }

  function mountComponent(vnode: any, container, parent) {
    const instance = createComponentInstance(vnode, parent);
    setupComponent(instance);
    setupRenderEffect(instance, container, vnode);
  }

  function setupRenderEffect(instance, container, vnode) {
    effect(() => {
      if (!instance.isMount) {
        console.log("init");
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        console.log(subTree);
        patch(null, subTree, container, instance);

        vnode.el = subTree.el;
        instance.isMount = true;
      } else {
        console.log("update");
        const { proxy } = instance;
        const prevSubTree = instance.subTree;
        const subTree = (instance.subTree = instance.render.call(proxy));
        console.log("subTree", subTree);
        console.log("prevSubTree", prevSubTree);
        debugger;
        patch(prevSubTree, subTree, container, instance);
        vnode.el = subTree.el;
      }
    });
  }

  function processElement(n1, n2: any, container: any) {
    if (!n1) {
      mountElement(n2, container, parent);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, contianer) {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);

    patchProps(el, oldProps, newProps);
  }

  function patchProps(el, oldProps: any, newProps: any) {
    for (let key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
    for (const key in oldProps) {
      debugger;
      const prevProp = oldProps[key];
      if (!(key in newProps)) {
        hostPatchProp(el, key, prevProp, null);
      }
    }
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
      hostPatchProp(el, key, null, val);
    }
    // container.append(el);
    hostInsert(el, container);
  }

  function mountChildren(children: any[], container: any, parent) {
    children.forEach((vnode) => {
      patch(null, vnode, container, parent);
    });
  }
  function processTextNode(n1, n2: any, container: any) {
    const { children } = n2;
    let el = (n2.el = document.createTextNode(children));
    container.append(el);
  }
  return {
    createApp: createAppApi(render),
  };
}
