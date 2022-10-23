import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  setup() {
    const count = ref(0);

    const onClick = () => {
      count.value++;
    };

    const props = ref({
      foo: "foo",
      bar: "bar",
    });

    const onChangePropDemo1 = () => {
      props.value.foo = "new-foo";
    };

    const onChangePropDemo2 = () => {
      props.value.foo = undefined;
    };

    const onChangePropDemo3 = () => {
      props.value = {
        foo: "foo",
      };
    };

    return {
      count,
      onClick,
      onChangePropDemo1,
      onChangePropDemo2,
      onChangePropDemo3,
      props,
    };
  },

  render() {
    return h("div", { id: "root", ...this.props }, [
      h("div", {}, "count: " + this.count),
      h("button", { onClick: this.onClick, class: "one-line-button" }, "click"),
      h(
        "button",
        { onClick: this.onChangePropDemo1, class: "one-line-button" },
        "change foo to new value"
      ),
      h(
        "button",
        { onClick: this.onChangePropDemo2, class: "one-line-button" },
        "change foo to undefined"
      ),
      h(
        "button",
        { onClick: this.onChangePropDemo3 },
        "remove the bar's value"
      ),
    ]);
  },
};
