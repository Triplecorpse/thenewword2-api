function validateEmail(email: string): boolean {
  return /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(email);
}

function validateUserInput(login: string): boolean {
  return /^([a-zA-Z0-9_\-.]+)$/.test(login);
}

function validateObject(obj: {[key: string]: any}, keys: string[], cb: (prop: any) => boolean): boolean {
  let resByCb = true;

  Object.keys(obj).forEach(key => {
    if (keys.includes(key) || keys.length === 0) {
      resByCb = resByCb && cb(obj[key]);
    }
  });

  return resByCb;
}

function validateRequiredKeys(obj: {[key: string]: any}, requiredKeys: string[]) {
  return requiredKeys.every((key) => !!obj[key]);
}

export const Validators = {
  email: validateEmail,
  simpleInput: validateUserInput,
  object: validateObject,
  objectHasRequiredKeys: validateRequiredKeys
}
