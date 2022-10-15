import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  // ui
  render() {
    return h(
      "div",
      {
        class: ["green"],
      },
      [
        h(Foo, {
          onAdd(a, b) {
            console.log("onAdd Handler");
            console.log(a, b);
          },
          onKebabEvent() {
            // debugger;
            console.log("The kebaba event work :)");
          },
        }),
        { class: ["red"] },
      ]
    );
  },

  setup() {
    return {
      msg: "hello world",
    };
  },
};
