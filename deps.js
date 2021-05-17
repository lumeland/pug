export {
  assert,
  assertEquals,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";
export {
  dirname,
  extname,
  join,
} from "https://deno.land/std@0.97.0/path/mod.ts";
export { default as isExpression } from "https://jspm.dev/is-expression@3.0.0";
export { default as characterParser } from "https://jspm.dev/character-parser@2.1.1";
export { default as constantinople } from "https://jspm.dev/constantinople@4.0.1";
export { default as addWith } from "https://jspm.dev/with@7.0.0";

export function stringify(obj) {
  if (obj instanceof Date) {
    return "new Date(" + stringify(obj.toISOString()) + ")";
  }
  if (obj === undefined) {
    return "undefined";
  }
  return JSON.stringify(obj)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/\//g, "\\u002F");
}

export const selfClosing = {
  "area": true,
  "base": true,
  "br": true,
  "col": true,
  "embed": true,
  "hr": true,
  "img": true,
  "input": true,
  "link": true,
  "meta": true,
  "param": true,
  "source": true,
  "track": true,
  "wbr": true,
};

export const doctypes = {
  "html": "<!DOCTYPE html>",
  "xml": '<?xml version="1.0" encoding="utf-8" ?>',
  "transitional":
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
  "strict":
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
  "frameset":
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
  "1.1":
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
  "basic":
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
  "mobile":
    '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',
  "plist":
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
};

export class TokenStream {
  constructor(tokens) {
    if (!Array.isArray(tokens)) {
      throw new TypeError("tokens must be passed to TokenStream as an array.");
    }
    this._tokens = tokens;
  }

  lookahead(index) {
    if (this._tokens.length <= index) {
      throw new Error("Cannot read past the end of a stream");
    }
    return this._tokens[index];
  }

  peek() {
    if (this._tokens.length === 0) {
      throw new Error("Cannot read past the end of a stream");
    }
    return this._tokens[0];
  }

  advance() {
    if (this._tokens.length === 0) {
      throw new Error("Cannot read past the end of a stream");
    }
    return this._tokens.shift();
  }

  defer(token) {
    this._tokens.unshift(token);
  }
}
