// deno-lint-ignore no-explicit-any
export type Callback<E = Error,T = any> = (error: Error | null, result?: T) => void;