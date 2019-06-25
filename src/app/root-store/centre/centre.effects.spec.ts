import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CentreService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { CentreStoreActions } from '@app/root-store';
import { Factory } from '@test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { CentreStoreEffects } from './centre.effects';
import { Centre } from '@app/domain/centres';
import { Action } from '@ngrx/store';

describe('centre-store effects', () => {

  let effects: CentreStoreEffects;
  let actions: Observable<any>;
  let centreService: CentreService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CentreStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(CentreStoreEffects);
    centreService = TestBed.get(CentreService);
    factory = new Factory();
  });

  describe('getCentreCountsRequestEffect', () => {

    it('should respond with success', () => {
      const centreCounts = factory.centreCounts();
      const action = CentreStoreActions.getCentreCountsRequest({ searchParams: new SearchParams() });
      const completion = CentreStoreActions.getCentreCountsSuccess({ centreCounts });
      spyOn(centreService, 'counts').and.returnValue(of(centreCounts));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.countsRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = CentreStoreActions.getCentreCountsRequest({ searchParams: new SearchParams() });
      const completion = CentreStoreActions.getCentreCountsFailure({ error });
      spyOn(centreService, 'counts').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.countsRequest$).toBeObservable(expected);
    });
  });

  describe('searchCentresRequestEffect', () => {

    it('should respond with success', () => {
      const searchParams = new SearchParams();
      const centre = new Centre().deserialize(factory.centre());
      const pagedReply = factory.pagedReply([ centre ]);
      const action = CentreStoreActions.searchCentresRequest({ searchParams });
      const completion = CentreStoreActions.searchCentresSuccess({ pagedReply });
      spyOn(centreService, 'search').and.returnValue(of(pagedReply));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const searchParams = new SearchParams();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = CentreStoreActions.searchCentresRequest({ searchParams });
      const completion = CentreStoreActions.searchCentresFailure({ error });
      spyOn(centreService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('addCentreRequestEffect', () => {

    it('should respond with success', () => {
      const centre = new Centre().deserialize(factory.centre());
      const action = CentreStoreActions.addCentreRequest({ centre });
      const completion = CentreStoreActions.addCentreSuccess({ centre });
      spyOn(centreService, 'add').and.returnValue(of(centre));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const centre = new Centre().deserialize(factory.centre());
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = CentreStoreActions.addCentreRequest({ centre });
      const completion = CentreStoreActions.addCentreFailure({ error });
      spyOn(centreService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('getCentreRequestEffect', () => {

    it('should respond with success', () => {
      const centre = new Centre().deserialize(factory.centre());
      const action = CentreStoreActions.getCentreRequest({ slug: centre.slug });
      const completion = CentreStoreActions.getCentreSuccess({ centre });
      spyOn(centreService, 'get').and.returnValue(of(centre));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const centre = factory.centre();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = CentreStoreActions.getCentreRequest({ slug: centre.slug });
      const completion = CentreStoreActions.getCentreFailure({ error });
      spyOn(centreService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let centre: Centre;
    let action: Action;
    let centreListener: any;

    beforeEach(() => {
      centre = new Centre().deserialize(factory.centre());
      action = CentreStoreActions.updateCentreRequest({
        centre,
        attributeName: 'name',
        value: factory.stringNext()
      });
      centreListener = jest.spyOn(centreService, 'update');
    });

    it('should respond with success', () => {
      const completion = CentreStoreActions.updateCentreSuccess({ centre });

      centreListener.mockReturnValue(of(centre));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = CentreStoreActions.updateCentreFailure({ error });

      centreListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
