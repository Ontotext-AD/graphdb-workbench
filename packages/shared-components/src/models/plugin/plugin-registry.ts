export interface PluginRegistry {
  get<T>(extensionPoint: string): T;

  add(plugin: unknown): void;
}
