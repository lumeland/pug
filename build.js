import dependencies from "./lib/dependencies.js";
import internals from "./lib/internals.js";
import sources from "./lib/sources.js";

export default function build(functions) {
  var fns = [];
  functions = functions.filter(function (fn) {
    return !internals[fn];
  });
  for (var i = 0; i < functions.length; i++) {
    if (fns.indexOf(functions[i]) === -1) {
      fns.push(functions[i]);
      functions.push.apply(functions, dependencies[functions[i]]);
    }
  }
  return fns
    .sort()
    .map(function (name) {
      return sources[name];
    })
    .join("\n");
}
