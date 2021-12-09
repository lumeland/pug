import type { Plugin } from "./plugin.ts";
import type { FilterOptions } from "./filter-options.ts";
import type { FilterAliases } from "./filter-aliases.ts";
import type { Cache } from "./cache.ts";
import type { Filter } from "./filter.ts";

// https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/pug

////////////////////////////////////////////////////////////
/// Options https://pugjs.org/api/reference.html#options ///
////////////////////////////////////////////////////////////
export interface Options {
  /** The name of the file being compiled. Used in exceptions, and required for relative includes and extends. Defaults to 'Pug'. */
  filename?: string;
  /** The root directory of all absolute inclusion. */
  basedir?: string;
  /** If the doctype is not specified as part of the template, you can specify it here. It is sometimes useful to get self-closing tags and remove mirroring of boolean attributes; see doctype documentation for more information. */
  doctype?: string;
  /** Adds whitespace to the resulting HTML to make it easier for a human to read using '  ' as indentation. If a string is specified, that will be used as indentation instead (e.g. '\t'). Defaults to false. */
  pretty?: boolean | string;
  /** Hash table of custom filters. Defaults to undefined. */
  filters?: Record<
    string,
    Filter
  >;
  /** Use a self namespace to hold the locals. It will speed up the compilation, but instead of writing variable you will have to write self.variable to access a property of the locals object. Defaults to false. */
  self?: boolean;
  /** If set to true, the tokens and function body are logged to stdout. */
  debug?: boolean;
  /** If set to true, the function source will be included in the compiled template for better error messages (sometimes useful in development). It is enabled by default unless used with Express in production mode. */
  compileDebug?: boolean;
  /** Add a list of global names to make accessible in templates. */
  globals?: Array<string>;
  /** If set to true, compiled functions are cached. filename must be set as the cache key. Only applies to render functions. Defaults to false. */
  cache?: boolean & Cache;
  /** Inline runtime functions instead of require-ing them from a shared version. For compileClient functions, the default is true so that one does not have to include the runtime. For all other compilation or rendering types, the default is false. */
  inlineRuntimeFunctions?: boolean;
  /** The name of the template function. Only applies to compileClient functions. Defaults to 'template'. */
  name?: string;

  plugins?: Plugin[];

  filterOptions?: FilterOptions;

  filterAliases?: FilterAliases;

  includeSources?: boolean;

  templateName?: string;

  /** When it is explicitly `true`, the source code include export module syntax */
  module?: boolean;
}