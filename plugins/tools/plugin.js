export function register(registry) {
  registry.registerExtension('tools', {
    label: 'New Tool',
    action: () => alert('New tool action')
  });
}
