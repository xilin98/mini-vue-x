import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = function () {
      console.log("You have press the foo component!");
      emit("add", 1, 2);
      // debugger;
      emit("kebabEvent");
    };
    return { emitAdd };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );
    const foo = h("div", {}, "foo");
    return h("div", {}, [foo, btn]);
  },
};
