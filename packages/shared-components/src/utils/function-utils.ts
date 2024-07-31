export function debounce(func, wait = 300) {
  let timer: string | number | NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), wait);
  };
}
