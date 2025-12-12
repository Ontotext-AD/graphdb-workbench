export interface PluginsManifestResponse {
  plugins: PluginDefinitionResponse[];
}

export interface PluginDefinitionResponse {
  name: string;
  entry: string;
}
