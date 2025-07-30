export interface PluginRegistry {
  get<T>(extensionPoint: string): T;
}
