import { PluginResolveOptions } from "./plugin-resolve-options.ts";

export type PluginResolve = (
  filename: string,
  source: string,
  options: PluginResolveOptions,
) => void;
