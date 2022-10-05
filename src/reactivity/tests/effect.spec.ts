import { reactive } from "../reactive";
import { effect } from "../effect";
it("effect", () => {
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