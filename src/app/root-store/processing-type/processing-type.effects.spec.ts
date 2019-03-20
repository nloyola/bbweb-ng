import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProcessingTypeService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { ProcessingTypeStoreActions } from '@app/root-store';
import { Factory } from '@test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { ProcessingTypeStoreEffects } from './processing-type.effects';
import { Action } from '@ngrx/store';
import { ProcessingType } from '@app/domain/studies';
import { AnnotationType } from '@app/domain/annotations';

describe('processingType-store effects', () => {

  let effects: ProcessingTypeStoreEffects;
  let actions: Observable<any>;
  let processingTypeService: ProcessingTypeService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ProcessingTypeStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(ProcessingTypeStoreEffects);
    processingTypeService = TestBed.get(ProcessingTypeService);
    factory = new Factory();
  });

  describe('searchRequestEffect', () => {

    it('should respond with success', () => {
      const searchParams = new SearchParams();
      const study = factory.study();
      const processingType = factory.processingType();
      const pagedReply = factory.pagedReply([ processingType ]);
      const action = new ProcessingTypeStoreActions.SearchProcessingTypesRequest({
        studyId: study.id,
        studySlug: study.slug,
        searchParams
      });
      const completion = new ProcessingTypeStoreActions.SearchProcessingTypesSuccess({ pagedReply });
      spyOn(processingTypeService, 'search').and.returnValue(of(pagedReply));

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
      const action = new ProcessingTypeStoreActions.SearchProcessingTypesRequest({
        studyId: study.id,
        studySlug: study.slug,
        searchParams
      });
      const completion = new ProcessingTypeStoreActions.SearchProcessingTypesFailure({ error });
      spyOn(processingTypeService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('getRequestEffect', () => {

    it('should respond with success', () => {
      const study = factory.study();
      const processingType = factory.processingType();
      const action = new ProcessingTypeStoreActions.GetProcessingTypeRequest({
        studySlug: study.slug,
        processingTypeSlug: processingType.slug
      });
      const completion = new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType });
      spyOn(processingTypeService, 'get').and.returnValue(of(processingType));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const study = factory.study();
      const processingType = factory.processingType();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = new ProcessingTypeStoreActions.GetProcessingTypeRequest({
        studySlug: study.slug,
        processingTypeSlug: processingType.slug
      });
      const completion = new ProcessingTypeStoreActions.GetProcessingTypeFailure({ error });
      spyOn(processingTypeService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('addRequestEffect', () => {

    it('should respond with success', () => {
      const processingType = factory.processingType();
      const action = new ProcessingTypeStoreActions.AddProcessingTypeRequest({ processingType });
      const completion = new ProcessingTypeStoreActions.AddProcessingTypeSuccess({ processingType });
      spyOn(processingTypeService, 'add').and.returnValue(of(processingType));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const processingType = factory.processingType();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = new ProcessingTypeStoreActions.AddProcessingTypeRequest({ processingType });
      const completion = new ProcessingTypeStoreActions.AddProcessingTypeFailure({ error });
      spyOn(processingTypeService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let processingType: ProcessingType;
    let action: Action;

    beforeEach(() => {
      processingType = factory.processingType();
      action = new ProcessingTypeStoreActions.UpdateProcessingTypeRequest({
        processingType,
        attributeName: 'name',
        value: factory.stringNext()
      });
      jest.spyOn(processingTypeService, 'update');
    });

    it('should respond with success', () => {
      const completion = new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess({ processingType });

      jest.spyOn(processingTypeService, 'update').mockReturnValue(of(processingType));
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
      const completion = new ProcessingTypeStoreActions.UpdateProcessingTypeFailure({ error });

      jest.spyOn(processingTypeService, 'update').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('addOrUpdateAnnotationTypeRequestEffect', () => {

    let annotationType: AnnotationType;
    let processingType: ProcessingType;
    let action: Action;

    beforeEach(() => {
      annotationType = factory.annotationType();
      processingType = factory.processingType({ annotationTypes: [ annotationType ]});
      action = new ProcessingTypeStoreActions.UpdateProcessingTypeAddOrUpdateAnnotationTypeRequest({
        processingType,
        annotationType
      });
      jest.spyOn(processingTypeService, 'addOrUpdateAnnotationType');
    });

    it('should respond with success', () => {
      const completion = new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess({ processingType });

      jest.spyOn(processingTypeService, 'addOrUpdateAnnotationType').mockReturnValue(of(processingType));
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
      const completion = new ProcessingTypeStoreActions.UpdateProcessingTypeFailure({ error });

      jest.spyOn(processingTypeService, 'addOrUpdateAnnotationType').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.addOrUpdateAnnotationTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeAnnotationTypeRequestEffect', () => {

    let annotationType: AnnotationType;
    let processingType: ProcessingType;
    let action: Action;

    beforeEach(() => {
      annotationType = factory.annotationType();
      processingType = factory.processingType({ annotationTypes: [ annotationType ]});
      action = new ProcessingTypeStoreActions.UpdateProcessingTypeRemoveAnnotationTypeRequest({
        processingType,
        annotationTypeId: annotationType.id
      });
      jest.spyOn(processingTypeService, 'removeAnnotationType');
    });

    it('should respond with success', () => {
      const completion = new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess({ processingType });

      jest.spyOn(processingTypeService, 'removeAnnotationType').mockReturnValue(of(processingType));
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
      const completion = new ProcessingTypeStoreActions.UpdateProcessingTypeFailure({ error });

      jest.spyOn(processingTypeService, 'removeAnnotationType').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeAnnotationTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeProcessingTypeRequestEffect', () => {

    let processingType: ProcessingType;
    let action: Action;

    beforeEach(() => {
      processingType = factory.processingType();
      action = new ProcessingTypeStoreActions.RemoveProcessingTypeRequest({ processingType });
      jest.spyOn(processingTypeService, 'removeProcessingType');
    });

    it('should respond with success', () => {
      const completion = new ProcessingTypeStoreActions.RemoveProcessingTypeSuccess({
        processingTypeId: processingType.id
      });

      jest.spyOn(processingTypeService, 'removeProcessingType').mockReturnValue(of(processingType.id));
      actions = hot('--a-', { a: action });
      expect(effects.removeProcessingTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = new ProcessingTypeStoreActions.RemoveProcessingTypeFailure({ error });

      jest.spyOn(processingTypeService, 'removeProcessingType').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeProcessingTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
