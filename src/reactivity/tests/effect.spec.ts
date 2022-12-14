import { reactive } from "../reactive";
import { effect, stop } from "../effect";
describe("effect", () => {
  it("basic function", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    user.age++;
    expect(nextAge).toBe(12);
  });

  it("return runner function when call effect function", () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "return value";
    });
    expect(foo).toBe(11);
    const res = runner();
    expect(foo).toBe(12);
    expect(res).toBe("return value");
  });

  it("scheduler", () => {
    // 1. fn will run when call effect
    // 2. set action will not trigger fn but scheduler
    // 3. runner will trigger fn

    let dummy;
    let run;
    let scheduler = jest.fn(() => {
      run = runner;
    });

    const obj = reactive({
      foo: 1,
    });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler,
      }
    );

    expect(dummy).toBe(1);
    expect(scheduler).not.toHaveBeenCalled();
    obj.foo++;

    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);

    run();
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;

    expect(dummy).toBe(2);

    // not reactive
    stop(runner);
    obj.prop = 3;
    obj.prop++;
    expect(dummy).toBe(2);

    runner();
    expect(dummy).toBe(4);
  });

  it("onStop", () => {
    const obj = reactive({ foo: 1 });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
