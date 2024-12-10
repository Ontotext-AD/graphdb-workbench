export function CustomLog() {
  return function (target: any, propertyKey: string) {
    const originalValue = target[propertyKey];

    Object.defineProperty(target, propertyKey, {
      get() {
        console.log(`Getting value of ${propertyKey}:`, originalValue);
        return originalValue;
      },
      set(newValue) {
        console.log(`Setting value of ${propertyKey} to:`, newValue);
        target[`_${propertyKey}`] = newValue;
      },
      configurable: true,
      enumerable: true,
    });
  };
}
