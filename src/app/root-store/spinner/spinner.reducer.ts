import { Action } from '@ngrx/store';
import { SpinnerActions, SpinnerActionTypes } from './spinner.actions';

// borrowed from here:
//
// https://itnext.io/angular-tutorial-create-loading-indicator-using-ngrx-687f8a66be0d

export interface State {
  active: number;
  actionsInProgress: any;
}

export const initialState: State = {
  active: 0,
  actionsInProgress: []
};

export function reducer(state = initialState, action: any): State {
  switch (action.type) {

    case SpinnerActionTypes.ShowSpinner: {
      const isActionAlreadyInProgress = state.actionsInProgress
        .filter((currentAction: any) => currentAction === action.payload.type)
        .length;

      // If the action in already in progress and is registered
      // we don't modify the state
      if (isActionAlreadyInProgress) {
        return state;
      }
      // Adding the action type in our actionsInProgress array
      const newActionsInProgress = [
        ...state.actionsInProgress,
        action.payload.type
      ];
      return {
        ...state,
        active: newActionsInProgress.length,
        actionsInProgress: newActionsInProgress
      };
    }


    case SpinnerActionTypes.HideSpinner: {
      // We remove trigger action from actionsInProgress array
      const newActionsInProgress = action.payload.triggerAction
        ? (state.actionsInProgress
           .filter((currentAction: Action) => currentAction !== action.payload.triggerAction))
        : state.actionsInProgress;

      return {
        ...state,
        actionsInProgress: newActionsInProgress,
        active: state.active > 0 ? newActionsInProgress.length : 0
      };
    }

    default:
      return state;
  }
}
