import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  // ui
  render() {
    window.self = this;
    this.$el;
    return h(
      "div",
      {
        id: "root",
        class: ["green"],
        onClick() {
          console.log("you click it");
        },
      },
      [
        h("div", { class: ["yellow"] }, "sub1"),
        h("a", { class: ["purple"] }, "sub2" + this.msg),
      ]
    );
  },
  setup() {
    return {
      msg: "hello world",
    };
  },
};
