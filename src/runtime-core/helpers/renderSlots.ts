import { createVnode } from "../vnode";

export function renderSlots(slots, name, info) {
  const slot = slots[name](info);
  if (Array.isArray(slot)) return createVnode("fragment", {}, slot);
  return slot;
}
