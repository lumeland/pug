# Pug Deno

[Pug library](https://pugjs.org/) ported to Deno, to use in [lume](https://lumeland.github.io/)

---

> Note: filters from jsTransformer are not supported, only custom filters.

Full documentation is at [pugjs.org](https://pugjs.org/)

Pug is a high-performance template engine heavily influenced by [Haml](http://haml.info/)
and implemented with JavaScript for [Node.js](http://nodejs.org) and browsers. For bug reports,
feature requests and questions, [open an issue](https://github.com/pugjs/pug/issues/new).
For discussion join the [chat room](https://gitter.im/pugjs/pug).

## Syntax

Pug is a clean, whitespace sensitive syntax for writing HTML.  Here is a simple example:

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

## License

MIT
