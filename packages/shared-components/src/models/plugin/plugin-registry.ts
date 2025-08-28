export interface PluginRegistry {
  get<T>(extensionPoint: string): T;

  add<T>(plugin: T): void;

  setPluginsManifest(pluginsManifest: unknown): void;
}
