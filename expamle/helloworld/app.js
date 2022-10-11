import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  // ui
  render() {
    return h("div", { id: "root", class: ["purple, yellow"] }, "mini-vue");
  },
  setup() {
    return {
      msg: "hello world",
    };
  },
};
