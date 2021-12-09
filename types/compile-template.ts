import { LocalsObject } from './locals-object.ts'

/**
 * A function that can be use to render html string of compiled template.
 */
export type CompileTemplate = (locals?: LocalsObject) => string;