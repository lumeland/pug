import * as runtime from "./runtime.js";

export default function wrap(template, templateName) {
  templateName = templateName || "template";
  return Function(
    "pug",
    template + "\n" + "return " + templateName + ";",
  )(runtime);
}
