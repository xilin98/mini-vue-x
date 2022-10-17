import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    console.log(this.$slots);
    const foo = h("p", {}, "foo");
    return h("div", {}, [
      renderSlots(this.$slots, "header", "I'm the header in Foo"),
      foo,
      renderSlots(this.$slots, "footer", "I'm the footer in Foo"),
    ]);
  },
  setup() {
    return {};
  },
};
