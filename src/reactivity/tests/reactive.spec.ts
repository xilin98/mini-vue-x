import {
  readonly,
  isReactive,
  reactive,
  isReadonly,
  shallowReadonly,
  isProxy,
} from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = {
      foo: 1,
    };
    const observe = reactive(original);
    expect(observe).not.toBe(original);
    expect(observe.foo).toBe(1);
  });
  it("isReactive", () => {
    const original = {
      foo: 1,
    };
    const observe = reactive(original);
    expect(isReactive(observe)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });

  it("isProxy", () => {
    const original = {
      foo: 1,
    };
    const observe = reactive(original);
    expect(isProxy(observe)).toBe(true);
    expect(isProxy(original)).toBe(false);
  });
});

describe("readonly", () => {
  it("Happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });
  it("warn when assign to readonly object", () => {
    console.warn = jest.fn();

    const user = readonly({
      age: 10,
    });

    user.age = 11;
    expect(console.warn).toBeCalled();
  });

  it("isReadonly", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
  });

  it("nest reactive", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };

    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});

describe("shallowReadonly", () => {
  it("only the first layer is readonly", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });
});
