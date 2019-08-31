// borrowed from here:
//
// https://itnext.io/angular-tutorial-create-loading-indicator-using-ngrx-687f8a66be0d

export function HideSpinner(triggerAction: string) {
  return function(Class: Function) {
    Object.defineProperty(Class.prototype, 'triggerAction', {
      value: triggerAction
    });
  };
}
