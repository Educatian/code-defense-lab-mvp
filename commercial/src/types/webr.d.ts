declare module "@r-wasm/webr" {
  export class WebR {
    constructor(options?: Record<string, unknown>);
    init(): Promise<void>;
    evalR(code: string): Promise<{
      toNumber: () => Promise<number>;
      toString: () => Promise<string>;
    }>;
    evalRString(code: string): Promise<string>;
  }
}
