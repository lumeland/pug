import type { PluginFunction } from './plugin-function.ts';
import type { PluginResolve } from './plugin-resolve.ts';

export interface Plugin {
    lex?: PluginFunction;
    parse?: PluginFunction;
    preParse?: PluginFunction;
    postParse?: PluginFunction;
    preLex?: PluginFunction;
    postLex?: PluginFunction;
    preLoad?: PluginFunction;
    generateCode?: PluginFunction;
    postFilters?: PluginFunction;
    preLink?: PluginFunction;
    postLink?: PluginFunction;
    preCodeGen?: PluginFunction;
    postCodeGen?: PluginFunction;
    read?: PluginFunction;
    resolve?: PluginResolve;
    postLoad: PluginFunction;
    preFilters: PluginFunction;
}