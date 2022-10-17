import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  render() {
    const app = h("div", {}, "App");
    const foo = h(
      Foo,
      {},
      {
        header: (info) => h("header", {}, "This is header" + "info pass from Foo" + info),
        footer: (info) => h("footer", {}, "This is footer" + "info pass from Foo" + info),
      }
    );
    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
};
