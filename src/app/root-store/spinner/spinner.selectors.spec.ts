import { SpinnerStoreReducer, SpinnerStoreSelectors } from "@app/root-store/spinner";

describe('spinner-store selectors', () => {

  it('selectSpinnerIsActive', () => {
    [ true, false].forEach(active => {
      const state = {
        spinner: {
          ...SpinnerStoreReducer.initialState,
          active
        }
      };

      expect(SpinnerStoreSelectors.selectSpinnerIsActive(state)).toBe(active);
    });
  });

});
