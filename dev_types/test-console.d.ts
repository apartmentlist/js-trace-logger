import { WriteStream } from 'fs';

interface TestStreamOutput {
  output: Array<string>;
  restore: Function;
}

declare class TestStream {
  constructor(stream: WriteStream);
  inspect(options: any): TestStreamOutput;
  inspectSync(options: any, fn: Function): Array<string>;
  inspectSync(fn: Function): Array<string>;
  ignore(options: any): Function;
  ignoreSync(options: any, fn: Function): void;
  ignoreSync(fn: Function): void;
}

export const stdout: TestStream;
export const stderr: TestStream;

