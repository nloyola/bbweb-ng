import { SpinnerStoreActions, SpinnerStoreReducer } from '@app/root-store/spinner';
import { initialState } from './spinner.reducer';

describe('Spinner Reducer', () => {
  it('unknown action should return the initial state', () => {
    const action = {} as any;
    const result = SpinnerStoreReducer.reducer(initialState, action);
    expect(result).toBe(initialState);
  });

  describe('ShowSpinner action', () => {

    it('when source action is not in progress, state is updated', () => {
      const sourceAction = {
        type: 'test-action',
        showLoader: true
      };
      const action = new SpinnerStoreActions.ShowSpinner(sourceAction);
      const state = SpinnerStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...SpinnerStoreReducer.initialState,
        active: 1,
        actionsInProgress: [
          action.payload.type
        ]
      });
    });

    it('when source action is already in progress, state is unchanged', () => {
      const sourceAction = {
        type: 'test-action',
        showLoader: true
      };
      const action = new SpinnerStoreActions.ShowSpinner(sourceAction);
      const expectedState = {
        ...SpinnerStoreReducer.initialState,
        active: 1,
        actionsInProgress: [
          action.payload.type
        ]
      };
      const state = SpinnerStoreReducer.reducer(expectedState, action);
      expect(state).toEqual(expectedState);
    });

  });

  describe('HideSpinner action', () => {

    it('when source action is in progress, state is updated', () => {
      const triggerAction = {
        type: 'test-trigger-action',
        showLoader: true
      };
      const sourceAction = {
        type: 'test-action',
        triggerAction: triggerAction.type
      };
      const action = new SpinnerStoreActions.HideSpinner(sourceAction);
      const state = SpinnerStoreReducer.reducer(
        {
          ...SpinnerStoreReducer.initialState,
          active: 1,
          actionsInProgress: [
            triggerAction.type
          ]
        },
        action);

      expect(state).toEqual({
        ...SpinnerStoreReducer.initialState,
        active: 0,
        actionsInProgress: []
      });
    });

    it('when source action is in not progress, state is unchanged', () => {
      const triggerAction = {
        type: 'test-trigger-action',
        showLoader: true
      };
      const sourceAction = {
        type: 'test-action',
        triggerAction: null
      };
      const action = new SpinnerStoreActions.HideSpinner(sourceAction);
      const expectedState = {
        ...SpinnerStoreReducer.initialState,
        active: 1,
        actionsInProgress: [
          triggerAction.type
        ]
      };
      const state = SpinnerStoreReducer.reducer(expectedState, action);
      expect(state).toEqual(expectedState);
    });

  });

});
