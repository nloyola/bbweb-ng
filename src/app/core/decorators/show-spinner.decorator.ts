// borrowed from here:
//
// https://itnext.io/angular-tutorial-create-loading-indicator-using-ngrx-687f8a66be0d

export function ShowSpinner() {
  return function (Class: Function) {
    Object.defineProperty(Class.prototype, 'showLoader', {
      value: true
    });
  };
}
