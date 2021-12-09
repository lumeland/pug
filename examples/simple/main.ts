import { compile, render, renderFile, Options } from "../../mod.ts";

const __dirname = new URL('.', import.meta.url).pathname;

const locals = {
  state: 'amazing',
  youAreUsingPug: true,
};

const options: Options = {
  filename: 'template.pug',
  pretty: true,
};

// compile
const fn = compile('h1#title Pug - node template engine is #{state}', options);
let html = fn(locals);
console.log("compile result:\n", html);

// render
html = render('p.text Hello World!', {...options, ...locals}) as string;
console.log("\nrender result:\n", html);

// renderFile
html = renderFile(__dirname + '/template.pug', {...options, ...locals}) as string;
console.log("\nrenderFile result:\n", html);