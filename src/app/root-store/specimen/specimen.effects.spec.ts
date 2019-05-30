import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SpecimenService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { CollectionEvent, Specimen } from '@app/domain/participants';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import * as SpecimenActions from './specimen.actions';
import { SpecimenStoreEffects } from './specimen.effects';

describe('specimen-store effects', () => {

  let effects: SpecimenStoreEffects;
  let actions: Observable<any>;
  let specimenService: SpecimenService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        SpecimenStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(SpecimenStoreEffects);
    specimenService = TestBed.get(SpecimenService);
    factory = new Factory();
  });

  describe('searchSpecimensRequestEffect', () => {

    it('should respond with success', () => {
      const event = new CollectionEvent().deserialize(factory.collectionEvent());
      const searchParams = new SearchParams();
      const specimen = new Specimen().deserialize(factory.specimen());
      const pagedReply = factory.pagedReply([ specimen ]);
      const action = SpecimenActions.searchSpecimensRequest({ event, searchParams });
      const completion = SpecimenActions.searchSpecimensSuccess({ pagedReply });
      spyOn(specimenService, 'search').and.returnValue(of(pagedReply));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const event = new CollectionEvent().deserialize(factory.collectionEvent());
      const searchParams = new SearchParams();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = SpecimenActions.searchSpecimensRequest({ event, searchParams });
      const completion = SpecimenActions.searchSpecimensFailure({ error });
      spyOn(specimenService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('addSpecimenRequestEffect', () => {

    it('should respond with success', () => {
      const event = new CollectionEvent().deserialize(factory.collectionEvent());
      const specimens = [ new Specimen().deserialize(factory.specimen()) ];
      const action = SpecimenActions.addSpecimensRequest({ event, specimens });
      const completion = SpecimenActions.addSpecimensSuccess({ event });
      spyOn(specimenService, 'add').and.returnValue(of(event));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const event = new CollectionEvent().deserialize(factory.collectionEvent());
      const specimens = [ new Specimen().deserialize(factory.specimen()) ];
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = SpecimenActions.addSpecimensRequest({ event, specimens });
      const completion = SpecimenActions.addSpecimensFailure({ error });
      spyOn(specimenService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('getSpecimenRequestEffect', () => {

    it('should respond with success', () => {
      const specimen = new Specimen().deserialize(factory.specimen());
      const action = SpecimenActions.getSpecimenRequest({ id: specimen.id });
      const completion = SpecimenActions.getSpecimenSuccess({ specimen });
      spyOn(specimenService, 'get').and.returnValue(of(specimen));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const specimen = factory.specimen();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = SpecimenActions.getSpecimenRequest({ id: specimen.id });
      const completion = SpecimenActions.getSpecimenFailure({ error });
      spyOn(specimenService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('removeSpecimenRequestEffect', () => {

    let specimen: Specimen;
    let action: Action;

    beforeEach(() => {
      specimen = new Specimen().deserialize(factory.specimen());
      action = SpecimenActions.removeSpecimenRequest({ specimen });
    });

    it('should respond with success', () => {
      const completion = SpecimenActions.removeSpecimenSuccess({ specimenId: specimen.id });

      jest.spyOn(specimenService, 'remove').mockReturnValue(of(specimen.id));
      actions = hot('--a-', { a: action });
      expect(effects.removeSpecimenRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = SpecimenActions.removeSpecimenFailure({ error });

      jest.spyOn(specimenService, 'remove').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeSpecimenRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
