# Pug Deno

[Pug library](https://pugjs.org/) ported to Deno 🦕.

---

> Note: filters from jsTransformer are not supported, only custom filters.

Full documentation is at [pugjs.org](https://pugjs.org/)

Pug is a high-performance template engine heavily influenced by
[Haml](http://haml.info/) and implemented with JavaScript for
[Node.js](http://nodejs.org) and browsers. For bug reports, feature requests and
questions, [open an issue](https://github.com/pugjs/pug/issues/new). For
discussion join the [chat room](https://gitter.im/pugjs/pug).

## Syntax

Pug is a clean, whitespace sensitive syntax for writing HTML. Here is a simple
example:

```pug
doctype html
html(lang="en")
  head
    title= pageTitle
    script(type='text/javascript').
      if (foo) bar(1 + 5)
  body
    h1 Pug - node template engine
    #container.col
      if youAreUsingPug
        p You are amazing
      else
        p Get on it!
      p.
        Pug is a terse and simple templating language with a
        strong focus on performance and powerful features.
```

Pug transforms the above to:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Pug</title>
    <script type="text/javascript">
      if (foo) bar(1 + 5)
    </script>
  </head>
  <body>
    <h1>Pug - node template engine</h1>
    <div id="container" class="col">
      <p>You are amazing</p>
      <p>Pug is a terse and simple templating language with a strong focus on performance and powerful features.</p>
    </div>
  </body>
</html>
```

## API

```ts
import {
  compile,
  Options,
  render,
  renderFile,
} from "https://cdn.jsdelivr.net/gh/lumeland/pug@master/mod.ts";

// compile
const fn = compile("h1#title Pug - node template engine #{state}");
const html = fn({
  state: "amazing",
});
console.log("compile result:\n", html);
// -> <h1 id="title">Pug - node template engine is amazing</h1>

// render
const html = render("p.text Hello World!");
console.log(html);
// -> <p class="text">Hello World!</p>

// renderFile
const html = renderFile("template.pug") as string;
console.log(html);
// -> <!DOCTYPE html>...
```

You can run this example with

```bash
deno run --allow-read examples/simple/main.ts
```

## License

MIT
