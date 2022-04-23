import { CompileTemplate } from "./compile-template.ts";

export interface Cache {
  [key: string]: string | CompileTemplate;
}
