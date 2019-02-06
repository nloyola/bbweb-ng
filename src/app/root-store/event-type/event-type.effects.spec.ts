import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EventTypeService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { EventTypeStoreActions } from '@app/root-store';
import { Factory } from '@app/test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { EventTypeStoreEffects } from './event-type.effects';

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
      const action = new EventTypeStoreActions.SearchEventTypesRequest({
        studyId: study.id,
        studySlug: study.slug,
        searchParams
      });
      const completion = new EventTypeStoreActions.SearchEventTypesSuccess({ pagedReply });
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
      const action = new EventTypeStoreActions.SearchEventTypesRequest({
        studyId: study.id,
        studySlug: study.slug,
        searchParams
      });
      const completion = new EventTypeStoreActions.SearchEventTypesFailure({ error });
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
      const action = new EventTypeStoreActions.GetEventTypeRequest({
        studySlug: study.slug,
        eventTypeSlug: eventType.slug
      });
      const completion = new EventTypeStoreActions.GetEventTypeSuccess({ eventType });
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
      const action = new EventTypeStoreActions.GetEventTypeRequest({
        studySlug: study.slug,
        eventTypeSlug: eventType.slug
      });
      const completion = new EventTypeStoreActions.GetEventTypeFailure({ error });
      spyOn(eventTypeService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('addRequestEffect', () => {

    it('should respond with success', () => {
      const eventType = factory.collectionEventType();
      const action = new EventTypeStoreActions.AddEventTypeRequest({ eventType });
      const completion = new EventTypeStoreActions.AddEventTypeSuccess({ eventType });
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
      const action = new EventTypeStoreActions.AddEventTypeRequest({ eventType });
      const completion = new EventTypeStoreActions.AddEventTypeFailure({ error });
      spyOn(eventTypeService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let eventType;
    let action;

    beforeEach(() => {
      eventType = factory.collectionEventType();
      action = new EventTypeStoreActions.UpdateEventTypeRequest({
        eventType,
        attributeName: 'name',
        value: factory.stringNext()
      });
      jest.spyOn(eventTypeService, 'update');
    });

    it('should respond with success', () => {
      const completion = new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType });

      eventTypeService.update.mockReturnValue(of(eventType));
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
      const completion = new EventTypeStoreActions.UpdateEventTypeFailure({ error });

      eventTypeService.update.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('addOrUpdateAnnotationTypeRequestEffect', () => {

    let annotationType;
    let eventType;
    let action;

    beforeEach(() => {
      annotationType = factory.annotationType();
      eventType = factory.collectionEventType({ annotationTypes: [ annotationType ]});
      action = new EventTypeStoreActions.UpdateEventTypeAddOrUpdateAnnotationTypeRequest({
        eventType,
        annotationType
      });
      jest.spyOn(eventTypeService, 'addOrUpdateAnnotationType');
    });

    it('should respond with success', () => {
      const completion = new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType });

      eventTypeService.addOrUpdateAnnotationType.mockReturnValue(of(eventType));
      actions = hot('--a-', { a: action });
      expect(effects.addOrUpdateAnnotationTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = new EventTypeStoreActions.UpdateEventTypeFailure({ error });

      eventTypeService.addOrUpdateAnnotationType.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.addOrUpdateAnnotationTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeAnnotationTypeRequestEffect', () => {

    let annotationType;
    let eventType;
    let action;

    beforeEach(() => {
      annotationType = factory.annotationType();
      eventType = factory.collectionEventType({ annotationTypes: [ annotationType ]});
      action = new EventTypeStoreActions.UpdateEventTypeRemoveAnnotationTypeRequest({
        eventType,
        annotationTypeId: annotationType.id
      });
      jest.spyOn(eventTypeService, 'removeAnnotationType');
    });

    it('should respond with success', () => {
      const completion = new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType });

      eventTypeService.removeAnnotationType.mockReturnValue(of(eventType));
      actions = hot('--a-', { a: action });
      expect(effects.removeAnnotationTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = new EventTypeStoreActions.UpdateEventTypeFailure({ error });

      eventTypeService.removeAnnotationType.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeAnnotationTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('addOrUpdateSpecimenDefinitionRequestEffect', () => {

    let specimenDefinition;
    let eventType;
    let action;

    beforeEach(() => {
      specimenDefinition = factory.collectedSpecimenDefinition();
      eventType = factory.collectionEventType({ specimenDefinitions: [ specimenDefinition ]});
      action = new EventTypeStoreActions.UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest({
        eventType,
        specimenDefinition
      });
      jest.spyOn(eventTypeService, 'addOrUpdateSpecimenDefinition');
    });

    it('should respond with success', () => {
      const completion = new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType });

      eventTypeService.addOrUpdateSpecimenDefinition.mockReturnValue(of(eventType));
      actions = hot('--a-', { a: action });
      expect(effects.addOrUpdateSpecimenDefinitionRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = new EventTypeStoreActions.UpdateEventTypeFailure({ error });

      eventTypeService.addOrUpdateSpecimenDefinition.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.addOrUpdateSpecimenDefinitionRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeSpecimenDefinitionRequestEffect', () => {

    let specimenDefinition;
    let eventType;
    let action;

    beforeEach(() => {
      specimenDefinition = factory.collectedSpecimenDefinition();
      eventType = factory.collectionEventType({ specimenDefinitions: [ specimenDefinition ]});
      action = new EventTypeStoreActions.UpdateEventTypeRemoveSpecimenDefinitionRequest({
        eventType,
        specimenDefinitionId: specimenDefinition.id
      });
      jest.spyOn(eventTypeService, 'removeSpecimenDefinition');
    });

    it('should respond with success', () => {
      const completion = new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType });

      eventTypeService.removeSpecimenDefinition.mockReturnValue(of(eventType));
      actions = hot('--a-', { a: action });
      expect(effects.removeSpecimenDefinitionRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = new EventTypeStoreActions.UpdateEventTypeFailure({ error });

      eventTypeService.removeSpecimenDefinition.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeSpecimenDefinitionRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeEventTypeRequestEffect', () => {

    let eventType;
    let action;

    beforeEach(() => {
      eventType = factory.collectionEventType();
      action = new EventTypeStoreActions.RemoveEventTypeRequest({ eventType });
      jest.spyOn(eventTypeService, 'removeEventType');
    });

    it('should respond with success', () => {
      const completion = new EventTypeStoreActions.RemoveEventTypeSuccess({ eventTypeId: eventType.id });

      eventTypeService.removeEventType.mockReturnValue(of(eventType.id));
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
      const completion = new EventTypeStoreActions.RemoveEventTypeFailure({ error });

      eventTypeService.removeEventType.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeEventTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
