import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EventTypeService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { EventTypeStoreActions } from '@app/root-store';
import { Factory } from '@test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { EventTypeStoreEffects } from './event-type.effects';
import { CollectionEventType, CollectedSpecimenDefinition } from '@app/domain/studies';
import { AnnotationType } from '@app/domain/annotations';
import { EventTypeActionsUnion } from './event-type.actions';

describe('eventType-store effects', () => {

  let effects: EventTypeStoreEffects;
  let actions: Observable<any>;
  let eventTypeService: EventTypeService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        EventTypeStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(EventTypeStoreEffects);
    eventTypeService = TestBed.get(EventTypeService);
    factory = new Factory();
  });

  describe('searchRequestEffect', () => {

    it('should respond with success', () => {
      const searchParams = new SearchParams();
      const study = factory.study();
      const eventType = factory.collectionEventType();
      const pagedReply = factory.pagedReply([ eventType ]);
      const action = EventTypeStoreActions.searchEventTypesRequest({
        studyId: study.id,
        studySlug: study.slug,
        searchParams
      });
      const completion = EventTypeStoreActions.searchEventTypesSuccess({ pagedReply });
      spyOn(eventTypeService, 'search').and.returnValue(of(pagedReply));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const searchParams = new SearchParams();
      const study = factory.study();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = EventTypeStoreActions.searchEventTypesRequest({
        studyId: study.id,
        studySlug: study.slug,
        searchParams
      });
      const completion = EventTypeStoreActions.searchEventTypesFailure({ error });
      spyOn(eventTypeService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('getRequestEffect', () => {

    it('should respond with success', () => {
      const study = factory.study();
      const eventType = factory.collectionEventType();
      const action = EventTypeStoreActions.getEventTypeRequest({
        studySlug: study.slug,
        eventTypeSlug: eventType.slug
      });
      const completion = EventTypeStoreActions.getEventTypeSuccess({ eventType });
      spyOn(eventTypeService, 'get').and.returnValue(of(eventType));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const study = factory.study();
      const eventType = factory.collectionEventType();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = EventTypeStoreActions.getEventTypeRequest({
        studySlug: study.slug,
        eventTypeSlug: eventType.slug
      });
      const completion = EventTypeStoreActions.getEventTypeFailure({ error });
      spyOn(eventTypeService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('addRequestEffect', () => {

    it('should respond with success', () => {
      const eventType = factory.collectionEventType();
      const action = EventTypeStoreActions.addEventTypeRequest({ eventType });
      const completion = EventTypeStoreActions.addEventTypeSuccess({ eventType });
      spyOn(eventTypeService, 'add').and.returnValue(of(eventType));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const eventType = factory.collectionEventType();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = EventTypeStoreActions.addEventTypeRequest({ eventType });
      const completion = EventTypeStoreActions.addEventTypeFailure({ error });
      spyOn(eventTypeService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let eventType: CollectionEventType;
    let action: EventTypeActionsUnion;

    beforeEach(() => {
      eventType = factory.collectionEventType();
      action = EventTypeStoreActions.updateEventTypeRequest({
        eventType,
        attributeName: 'name',
        value: factory.stringNext()
      });
    });

    it('should respond with success', () => {
      const completion = EventTypeStoreActions.updateEventTypeSuccess({ eventType });

      jest.spyOn(eventTypeService, 'update').mockReturnValue(of(eventType));
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
      const completion = EventTypeStoreActions.updateEventTypeFailure({ error });

      jest.spyOn(eventTypeService, 'update').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    describe('when adding annotation types', () => {

      let annotationType: AnnotationType;

      beforeEach(() => {
        annotationType = factory.annotationType();
        eventType = factory.collectionEventType({ annotationTypes: [ annotationType ]});
        action = EventTypeStoreActions.updateEventTypeRequest({
          eventType,
          attributeName: 'addOrUpdateAnnotationType',
          value: annotationType
        });
        jest.spyOn(eventTypeService, 'update');
      });

      it('should respond with success', () => {
        const completion = EventTypeStoreActions.updateEventTypeSuccess({ eventType });

        jest.spyOn(eventTypeService, 'update').mockReturnValue(of(eventType));
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
        const completion = EventTypeStoreActions.updateEventTypeFailure({ error });

        jest.spyOn(eventTypeService, 'update').mockReturnValue(throwError(error));
        actions = hot('--a-', { a: action });
        expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
      });
    });

    describe('when removing an Annotation Type', () => {

      let annotationType: AnnotationType;

      beforeEach(() => {
        annotationType = factory.annotationType();
        eventType = factory.collectionEventType({ annotationTypes: [ annotationType ]});
        action = EventTypeStoreActions.updateEventTypeRequest({
          eventType,
          attributeName: 'removeAnnotationType',
          value: annotationType.id
        });
      });

      it('should respond with success', () => {
        const completion = EventTypeStoreActions.updateEventTypeSuccess({ eventType });

        jest.spyOn(eventTypeService, 'update').mockReturnValue(of(eventType));
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
        const completion = EventTypeStoreActions.updateEventTypeFailure({ error });

        jest.spyOn(eventTypeService, 'update').mockReturnValue(throwError(error));
        actions = hot('--a-', { a: action });
        expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
      });
    });

    describe('when adding or updating a Specimen Definition', () => {

      let specimenDefinition: CollectedSpecimenDefinition;

      beforeEach(() => {
        specimenDefinition = factory.collectedSpecimenDefinition();
        eventType = factory.collectionEventType({ specimenDefinitions: [ specimenDefinition ]});
        action = EventTypeStoreActions.updateEventTypeRequest({
          eventType,
          attributeName: 'addOrUpdateSpecimenDefinition',
          value: specimenDefinition
        });
      });

      it('should respond with success', () => {
        const completion = EventTypeStoreActions.updateEventTypeSuccess({ eventType });

        jest.spyOn(eventTypeService, 'update').mockReturnValue(of(eventType));
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
        const completion = EventTypeStoreActions.updateEventTypeFailure({ error });

        jest.spyOn(eventTypeService, 'update').mockReturnValue(throwError(error));
        actions = hot('--a-', { a: action });
        expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
      });
    });

    describe('when removing a SpecimenDefinition', () => {

      let specimenDefinition: CollectedSpecimenDefinition;

      beforeEach(() => {
        specimenDefinition = factory.collectedSpecimenDefinition();
        eventType = factory.collectionEventType({ specimenDefinitions: [ specimenDefinition ]});
        action = EventTypeStoreActions.updateEventTypeRequest({
          eventType,
          attributeName: 'removeSpecimenDefinition',
          value: specimenDefinition.id
        });
      });

      it('should respond with success', () => {
        const completion = EventTypeStoreActions.updateEventTypeSuccess({ eventType });

        jest.spyOn(eventTypeService, 'update').mockReturnValue(of(eventType));
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
        const completion = EventTypeStoreActions.updateEventTypeFailure({ error });

        jest.spyOn(eventTypeService, 'update').mockReturnValue(throwError(error));
        actions = hot('--a-', { a: action });
        expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
      });
    });
  });

  describe('removeEventTypeRequestEffect', () => {

    let eventType;
    let action;

    beforeEach(() => {
      eventType = factory.collectionEventType();
      action = EventTypeStoreActions.removeEventTypeRequest({ eventType });
      jest.spyOn(eventTypeService, 'removeEventType');
    });

    it('should respond with success', () => {
      const completion = EventTypeStoreActions.removeEventTypeSuccess({ eventTypeId: eventType.id });

      jest.spyOn(eventTypeService, 'removeEventType').mockReturnValue(of(eventType.id));
      actions = hot('--a-', { a: action });
      expect(effects.removeEventTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = EventTypeStoreActions.removeEventTypeFailure({ error });

      jest.spyOn(eventTypeService, 'removeEventType').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeEventTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
