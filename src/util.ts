export interface TemplateParam {
  [key: string]: string;
}

export const compileTemplate = function (str: string): (passed: TemplateParam) => string {
  const definedParams: Array<string> = extractParams(str);
  const func = new Function(...definedParams, ['return `', str, '`;'].join(''));
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
  const reg = /\$\{(\w+)\}/g;
  const params: Array<string> = [];
  let matches: RegExpExecArray | null;
  while ((matches = reg.exec(str))) {
    params.push(matches[1]);
  }
  return params;
};

export const formatUTCDateRuby = function (d: Date): string {
  // '2020-05-13 18:01:16 +0000'
  const year = d.getUTCFullYear();
  const month = `0${d.getUTCMonth() + 1}`.slice(-2);
  const day = `0${d.getUTCDate()}`.slice(-2);
  const hour = `0${d.getUTCHours()}`.slice(-2);
  const minutes = `0${d.getUTCMinutes()}`.slice(-2);
  const seconds = `0${d.getUTCSeconds()}`.slice(-2);
  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds} +0000`;
};
