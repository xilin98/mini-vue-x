import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
    });

    const age = computed(() => {
      return user.age;
    });

    expect(age.value).toBe(1);
  });

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should  not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // when the value it depend on has been changed
    // lazy
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // computed now
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // Won't compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
