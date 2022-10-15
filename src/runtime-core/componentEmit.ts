export function emit(instance, event, ...arg) {
  const { props } = instance;
  event = kebabToCamel(event);
  const handler = props["on" + event.charAt(0).toUpperCase() + event.slice(1)];
  if (handler) handler(...arg);
}

function kebabToCamel(str) {
  return str.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}
