import { PluginFunctionOptions } from "./plugin-function-options.ts";

// deno-lint-ignore no-explicit-any
export type PluginFunction = (
  value: any,
  options: PluginFunctionOptions,
) => void;
