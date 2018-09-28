import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { cold, hot } from 'jasmine-marbles';
import { SpinnerEffects } from './spinner.effects';
import { SpinnerStoreActions } from '@app/root-store/spinner';

describe('SpinnerEffects', () => {
  let actions$: Observable<any>;
  let effects: SpinnerEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SpinnerEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get(SpinnerEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('showLoader$ effect creates a ShowSpinner Action', () => {

    it('creates a ShowSpinner action when showLoader is TRUE', () => {
      const action = {
        type: 'test-action',
        showLoader: true
      };
      const completion = new SpinnerStoreActions.ShowSpinner(action);
      actions$ = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });
      expect(effects.showLoader$).toBeObservable(expected);
    });

    it('does not create a ShowSpinner action when showLoader is FALSE', () => {
      const action = {
        type: 'test-action',
        showLoader: false
      };
      const completion = new SpinnerStoreActions.ShowSpinner(action);
      actions$ = hot('--a-', { a: action });
      const expected = cold('---');
      expect(effects.showLoader$).toBeObservable(expected);
    });

  });

  describe('hideLoader$ effect creates a HideSpinner Action', () => {

    it('creates a HideSpinner action when triggerAction is defined', () => {
      const triggerAction = {
        type: 'test-trigger-action',
        showLoader: true
      };
      const action = {
        type: 'test-action',
        triggerAction
      };
      const completion = new SpinnerStoreActions.HideSpinner(action);
      actions$ = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });
      expect(effects.hideLoader$).toBeObservable(expected);
    });

    it('does not create a HideSpinner action when triggerAction is not defined', () => {
      const action = {
        type: 'test-action',
        triggerAction: null
      };
      const completion = new SpinnerStoreActions.HideSpinner(action);
      actions$ = hot('--a-', { a: action });
      const expected = cold('---');
      expect(effects.hideLoader$).toBeObservable(expected);
    });

  });
});
