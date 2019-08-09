import { HOTP as HOTPNext, TOTP as TOTPNext } from 'otplib-core';
import { Authenticator as AuthenticatorNext } from 'otplib-authenticator';

export function epochUnixToJS(opt = {}) {
  if (!opt || typeof opt !== 'object') {
    return {};
  }

  const { epoch, ...others } = opt;

  if (epoch === null) {
    return others;
  }

  if (typeof epoch === 'number') {
    return {
      ...opt,
      epoch: opt.epoch * 1000
    };
  }

  return opt;
}

export function epochJSToUnix(opt = {}) {
  if (!opt || typeof opt !== 'object') {
    return {};
  }

  const { epoch, ...others } = opt;

  if (epoch === null) {
    return others;
  }

  if (typeof epoch === 'number') {
    return {
      ...opt,
      epoch: epoch / 1000
    };
  }

  return opt;
}

export function createV11(Base, legacyOptions) {
  class Legacy extends Base {
    constructor(defaultOptions = {}) {
      super(epochUnixToJS({ ...legacyOptions, ...defaultOptions }));
    }

    static get name() {
      // Overrides the derived class name
      return Base.name;
    }

    set options(opt = {}) {
      super.options = epochUnixToJS(opt);
    }

    get options() {
      console.warn(
        Base.name,
        'The [OTP].options getter will remove epoch if it is set to null'
      );
      return epochJSToUnix(super.options);
    }

    get defaultOptions() {
      console.warn(
        Base.name,
        'The [OTP].defaultOptions getter has been deprecated in favour of the [OTP].options getter' +
          '\n\n The [OTP].options getter now returns the combined defaultOptions and options values' +
          'instead of setting options when adding defaultOptions.'
      );

      return Object.freeze(epochJSToUnix(this._defaultOptions));
    }

    set defaultOptions(opt) {
      console.warn(
        Base.name,
        'The [OTP].defaultOptions setter has been deprecated in favour of the [OTP].clone(defaultOptions) function'
      );
      this._defaultOptions = Object.freeze({
        ...this._defaultOptions,
        ...epochUnixToJS(opt)
      });
    }

    get optionsAll() {
      console.warn(
        Base.name,
        'The [OTP].optionsAll getter has been deprecated in favour of the [OTP].allOptions() function.' +
          '\n That epoch returned here will be in Unix Epoch, while [OTP].allOptions()' +
          ' will return JavaScript epoch.'
      );
      return epochJSToUnix(super.allOptions());
    }

    getClass() {
      return Legacy;
    }

    verify(...args) {
      try {
        return super.verify(...args);
      } catch (err) {
        return false;
      }
    }
  }

  Legacy.prototype[Base.name] = Legacy;
  return Legacy;
}

export const HOTP = createV11(HOTPNext, {});

export const TOTP = createV11(TOTPNext, {
  epoch: null,
  step: 30,
  window: 0
});

export const Authenticator = createV11(AuthenticatorNext, {
  encoding: 'hex',
  epoch: null,
  step: 30,
  window: 0
});
