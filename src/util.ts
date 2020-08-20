interface TemplateParam {
  [key: string]: string;
}

export const compileTemplate = function (str: string): Function {
  const definedParams: Array<string> = extractParams(str);
  const func: Function = new Function(...definedParams, ['return `', str, '`;'].join(''));
  return function (passed: TemplateParam): string {
    const passedParams: Array<string> = [];
    definedParams.forEach((definedKey) => {
      const passedValue = passed[definedKey];
      if (passedValue === undefined) {
        throw new Error(`You need to pass a value with "${definedKey}"`);
      }
      passedParams.push(passedValue);
    });
    return func.apply(func, passedParams);
  };
};

export const extractParams = function (str: string): Array<string> {
  // The following regex is not comprehensive
  // but I think it's enough for now?
  const reg: RegExp = /\$\{(\w+)\}/g;
  const params: Array<string> = [];
  let matches: RegExpExecArray | null;
  while ((matches = reg.exec(str))) {
    params.push(matches[1]);
  }
  return params;
};
