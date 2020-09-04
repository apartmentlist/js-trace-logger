export interface TemplateParam {
    [key: string]: string;
}
export declare const compileTemplate: (str: string) => (passed: TemplateParam) => string;
export declare const extractParams: (str: string) => Array<string>;
export declare const formatUTCDateRuby: (d: Date) => string;
