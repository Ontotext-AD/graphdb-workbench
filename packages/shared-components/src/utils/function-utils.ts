export function debounce<T extends (...args: unknown[]) => void>(func: T, wait = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>): void => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), wait);
  };
}
