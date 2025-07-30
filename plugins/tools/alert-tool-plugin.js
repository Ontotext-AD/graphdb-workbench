export function register(registry) {
  const definition = {
    label: 'Alert Tool',
    action: () => alert('Alert tool action')
  };
  console.log('%cRegister', 'background: yellow', definition.label);
  registry.add('tools', definition);
}
