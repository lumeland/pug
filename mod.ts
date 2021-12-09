// deno-lint-ignore-file no-explicit-any
// Allow any as long as not all types are defined

/*!
 * Pug
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import { extname } from "./deps.js";
import lex from "./lexer.js";
import stripComments from "./strip-comments.js";
import parse from "./parser.js";
import load from "./load.js";
import handleFilters from "./lib/handle-filters.js";
import link from "./linker.js";
import generateCode from "./code-gen.js";
import * as runtime from "./runtime.js";
import runtimeWrap from "./runtime-wrap.js";

/**
 * Types, interfaces, enums, etc
 */

import type {
  LexerOptions,
  Options,
  ParserOptions,
  Plugin,
  PluginType,
  Cache,
  Callback,
  DebugSources,
  Token,
  PluginFunction,
  PluginFunctionOptions,
  PluginResolve,
  CompileTemplate,
  Filter,
  LocalsObject,
} from './types/index.ts';


// Export types
export type {
  LexerOptions,
  Options,
  ParserOptions,
  Plugin,
  PluginType,
  Cache,
  Callback,
  DebugSources,
  Token,
  PluginFunction,
  PluginFunctionOptions,
  PluginResolve,
  CompileTemplate,
  Filter,
  LocalsObject,
}

/**
 * Name for detection
 */

export const name = "Pug";

/**
 * Pug runtime helpers.
 */

export { runtime };

/**
 * Template function cache.
 */

export const cache: Cache = {};

function applyPlugins(value: any, options: any, plugins: Plugin[], name: PluginType) {
  return plugins.reduce(function (value, plugin) {
    return typeof plugin[name] === 'function' ? (plugin[name] as PluginFunction)(value, options) : value;
  }, value);
}

function findReplacementFunc(plugins: Plugin[], name: PluginType): any {
  const eligiblePlugins = plugins.filter(function (plugin) {
    return plugin[name] as PluginFunction;
  });

  if (eligiblePlugins.length > 1) {
    throw new Error("Two or more plugins all implement " + name + " method.");
  } else if (eligiblePlugins.length) {
    return (eligiblePlugins[0][name] as PluginFunction).bind(eligiblePlugins[0]);
  }
  return null;
}

/**
 * Object for global custom filters.  Note that you can also just pass a `filters`
 * option to any other method.
 */
export const filters: Record<string, Filter> = {};

/**
 * Compile the given `str` of pug and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object}
 * @api private
 */
function compileBody(str: string, options: Options) {
  if (!options.filename) {
    throw new Error("Filename not set!");
  }
  const debugSources: DebugSources = {};
  debugSources[options.filename] = str;
  const dependencies: string[] = [];
  const plugins = options.plugins || [];
  let ast = load.string(str, {
    filename: options.filename,
    basedir: options.basedir,
    lex: function (str: string, options: PluginFunctionOptions) {
      const lexOptions: LexerOptions = {
        plugins: []
      };
      Object.keys(options).forEach(function (key) {
        (lexOptions as any)[key] = (options as any)[key];
      });
      lexOptions.plugins.push(...plugins
        .filter(function (plugin) {
          return !!plugin.lex;
        })
        .map(function (plugin) {
          return plugin.lex as PluginFunction;
        }));
      const contents = applyPlugins(
        str,
        { filename: options.filename },
        plugins,
        "preLex",
      );
      return applyPlugins(
        lex(contents, lexOptions),
        options,
        plugins,
        "postLex",
      );
    },
    parse: function (tokens: Token[], options: ParserOptions) {
      tokens = tokens.map(function (token) {
        if (token.type === "path" && extname(token.val) === "") {
          return {
            type: "path",
            loc: token.loc,
            val: token.val + ".pug",
          };
        }
        return token;
      });
      tokens = stripComments(tokens, options);
      tokens = applyPlugins(tokens, options, plugins, "preParse");
      const parseOptions: ParserOptions = {
        plugins: [],
      };
      Object.keys(options).forEach(function (key) {
        (parseOptions as any)[key] = (options as any)[key];
      });
      parseOptions.plugins.push(...plugins
        .filter(function (plugin) {
          return !!plugin.parse;
        })
        .map(function (plugin) {
          return plugin.parse as PluginFunction;
        }));

      return applyPlugins(
        applyPlugins(
          parse(tokens, parseOptions),
          options,
          plugins,
          "postParse",
        ),
        options,
        plugins,
        "preLoad",
      );
    },
    resolve: function (filename: string, source: string, loadOptions: PluginFunctionOptions) {
      const replacementFunc = findReplacementFunc(plugins, "resolve") as PluginResolve | null;
      if (replacementFunc) {
        return replacementFunc(filename, source, options);
      }

      return load.resolve(filename, source, loadOptions);
    },
    read: function (filename: string, loadOptions: PluginFunctionOptions) {
      dependencies.push(filename);

      let contents: string;

      const replacementFunc = findReplacementFunc(plugins, "read");
      if (replacementFunc) {
        contents = replacementFunc(filename, options) as string;
      } else {
        contents = load.read(filename, loadOptions);
      }

      debugSources[filename] = contents;
      return contents;
    },
  });
  ast = applyPlugins(ast, options, plugins, "postLoad");
  ast = applyPlugins(ast, options, plugins, "preFilters");

  const filtersSet: Record<string, Filter> = {};
  Object.keys(filters).forEach(function (key) {
    filtersSet[key] = filters[key];
  });
  if (options.filters) {
    Object.keys(options.filters).forEach(function (key) {
      if (options.filters) {
        filtersSet[key] = options.filters[key];
      }
    });
  }
  ast = handleFilters(
    ast,
    filtersSet,
    options.filterOptions,
    options.filterAliases,
  );

  ast = applyPlugins(ast, options, plugins, "postFilters");
  ast = applyPlugins(ast, options, plugins, "preLink");
  ast = link(ast);
  ast = applyPlugins(ast, options, plugins, "postLink");

  // Compile
  ast = applyPlugins(ast, options, plugins, "preCodeGen");
  let js = (findReplacementFunc(plugins, "generateCode") || generateCode)(ast, {
    pretty: options.pretty,
    compileDebug: options.compileDebug,
    doctype: options.doctype,
    inlineRuntimeFunctions: options.inlineRuntimeFunctions,
    globals: options.globals,
    self: options.self,
    includeSources: options.includeSources ? debugSources : false,
    templateName: options.templateName,
  }) as string;
  js = applyPlugins(js, options, plugins, "postCodeGen");

  // Debug compiler
  if (options.debug) {
    console.error(
      "\nCompiled Function:\n\n\u001b[90m%s\u001b[0m",
      js?.replace(/^/gm, "  "),
    );
  }

  return { body: js, dependencies: dependencies };
}

/**
 * Get the template from a string or a file, either compiled on-the-fly or
 * read from cache (if enabled), and cache the template if needed.
 *
 * If `str` is not set, the file specified in `options.filename` will be read.
 *
 * If `options.cache` is true, this function reads the file from
 * `options.filename` so it must be set prior to calling this function.
 *
 * @param {Object} options
 * @param {String=} str
 * @return {Function}
 * @api private
 */
function handleTemplateCache(options: Options, str?: string): CompileTemplate {
  if (!options.filename) {
    throw new Error("Filename not set!");
  }
  const key = options.filename;
  if (options.cache && cache[key]) {
    return cache[key] as CompileTemplate;
  } else {
    if (str === undefined) str = Deno.readTextFileSync(options.filename);
    const templ = compile(str, options);
    if (options.cache) cache[key] = templ;
    return templ;
  }
}

/**
 * Compile a `Function` representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *   - `filename` used to improve errors when `compileDebug` is not `false` and to resolve imports/extends
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */
export function compile(str: string, options: Options = {}) {
  str = String(str);

  const parsed = compileBody(str, {
    compileDebug: options.compileDebug !== false,
    filename: options.filename,
    basedir: options.basedir,
    pretty: options.pretty,
    doctype: options.doctype,
    inlineRuntimeFunctions: options.inlineRuntimeFunctions,
    globals: options.globals,
    self: options.self,
    includeSources: options.compileDebug === true,
    debug: options.debug,
    templateName: "template",
    filters: options.filters,
    filterOptions: options.filterOptions,
    filterAliases: options.filterAliases,
    plugins: options.plugins,
  });

  const res: CompileTemplate = options.inlineRuntimeFunctions
    ? new Function("", parsed.body + ";return template;")()
    : runtimeWrap(parsed.body);

  (res as any).dependencies = parsed.dependencies;

  return res;
}

/**
 * Compile a JavaScript source representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *   - `module` when it is explicitly `true`, the source code include export module syntax
 *
 * @param {String} str
 * @param {Options} options
 * @return {Object}
 * @api public
 */
export function compileClientWithDependenciesTracked(str: string, options: Options = {}) {
  str = String(str);
  const parsed = compileBody(str, {
    compileDebug: options.compileDebug,
    filename: options.filename,
    basedir: options.basedir,
    pretty: options.pretty,
    doctype: options.doctype,
    inlineRuntimeFunctions: options.inlineRuntimeFunctions !== false,
    globals: options.globals,
    self: options.self,
    includeSources: options.compileDebug,
    debug: options.debug,
    templateName: options.name || "template",
    filters: options.filters,
    filterOptions: options.filterOptions,
    filterAliases: options.filterAliases,
    plugins: options.plugins,
  });

  let body = parsed.body;

  if (options.module) {
    if (options.inlineRuntimeFunctions === false) {
      body = 'const pug = require("pug-runtime");' + body;
    }
    body += " module.exports = " + (options.name || "template") + ";";
  }

  return { body: body, dependencies: parsed.dependencies };
}

/**
 * Compile a JavaScript source representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *
 * @param {String} str
 * @param {Options} options
 * @return {String}
 * @api public
 */
export function compileClient(str: string, options: Options) {
  return compileClientWithDependenciesTracked(str, options).body;
}

/**
 * Compile a `Function` representation of the given pug file.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *
 * @param {String} path
 * @param {Options} options
 * @return {Function}
 * @api public
 */
export function compileFile(path: string, options: Options) {
  options = options || {};
  options.filename = path;
  return handleTemplateCache(options);
}

/**
 * Render the given `str` of pug.
 *
 * Options:
 *
 *   - `cache` enable template caching
 *   - `filename` filename required for `include` / `extends` and caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */

export function render(str: string, options?: (Options & LocalsObject) | Callback, fn?: Callback<Error,string>): string | void {
  // support callback API
  if ("function" == typeof options) {
    (fn = options), (options = undefined);
  }
  if (typeof fn === "function") {
    let res: string;
    try {
      res = render(str, options) as string;
    } catch (ex) {
      return fn(ex);
    }
    return fn(null, res);
  }

  options = options || {};

  // cache requires .filename
  if (options.cache && !options.filename) {
    throw new Error('the "filename" option is required for caching');
  }

  return handleTemplateCache(options, str)(options);
}

/**
 * Render a Pug file at the given `path`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */
export function renderFile(path: string, options?: (Options & LocalsObject) | Callback, fn?: Callback): string | void {
  // support callback API
  if ("function" == typeof options) {
    (fn = options), (options = undefined);
  }
  if (typeof fn === "function") {
    let res: string;
    try {
      res = renderFile(path, options) as string;
    } catch (ex) {
      return fn(ex);
    }
    return fn(null, res);
  }

  options = options || {};

  options.filename = path;
  return handleTemplateCache(options)(options);
}

/**
 * Compile a Pug file at the given `path` for use on the client.
 *
 * @param {String} path
 * @param {Object} options
 * @returns {String}
 * @api public
 */
export function compileFileClient(path: string, options: Options): string {
  const key = path + ":client";
  options = options || {};

  options.filename = path;

  if (options.cache && cache[key]) {
    return cache[key] as string;
  }

  const decoder = new TextDecoder("utf-8");
  const data = Deno.readFileSync(options.filename);
  const str = decoder.decode(data);
  const out = compileClient(str, options);
  if (options.cache) cache[key] = out;
  return out;
}
