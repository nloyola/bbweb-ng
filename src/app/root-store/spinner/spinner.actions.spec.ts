import { SpinnerStoreActions } from '@app/root-store/spinner';

describe('spinner-store actions', () => {
  it('ShowSpinner', () => {
    const payload = {
      type: 'test-action',
      showLoader: true
    };
    const action = new SpinnerStoreActions.ShowSpinner(payload);
    expect({ ...action }).toEqual({
      type: SpinnerStoreActions.SpinnerActionTypes.ShowSpinner,
      payload
    });
  });

  it('HideSpinner', () => {
    const payload = {
      type: 'test-action',
      showLoader: true
    };
    const action = new SpinnerStoreActions.HideSpinner(payload);
    expect({ ...action }).toEqual({
      type: SpinnerStoreActions.SpinnerActionTypes.HideSpinner,
      payload
    });
  });
});
