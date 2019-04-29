import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StudyService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { AnnotationType } from '@app/domain/annotations';
import { Study } from '@app/domain/studies';
import { StudyStoreActions } from '@app/root-store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { StudyStoreEffects } from './study.effects';

describe('study-store effects', () => {

  let effects: StudyStoreEffects;
  let actions: Observable<any>;
  let studyService: StudyService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        StudyStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(StudyStoreEffects);
    studyService = TestBed.get(StudyService);
    factory = new Factory();
  });

  describe('getStudyCountsRequestEffect', () => {

    it('should respond with success', () => {
      const studyCounts = factory.studyCounts();
      const action = StudyStoreActions.getStudyCountsRequest();
      const completion = StudyStoreActions.getStudyCountsSuccess({ studyCounts });
      spyOn(studyService, 'counts').and.returnValue(of(studyCounts));

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
      const action = StudyStoreActions.getStudyCountsRequest();
      const completion = StudyStoreActions.getStudyCountsFailure({ error });
      spyOn(studyService, 'counts').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.countsRequest$).toBeObservable(expected);
    });
  });

  describe('searchStudiesRequestEffect', () => {

    it('should respond with success', () => {
      const searchParams = new SearchParams();
      const study = factory.study();
      const pagedReply = factory.pagedReply([ study ]);
      const action = StudyStoreActions.searchStudiesRequest({ searchParams });
      const completion = StudyStoreActions.searchStudiesSuccess({ pagedReply });
      spyOn(studyService, 'search').and.returnValue(of(pagedReply));

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
      const action = StudyStoreActions.searchStudiesRequest({ searchParams });
      const completion = StudyStoreActions.searchStudiesFailure({ error });
      spyOn(studyService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('addStudyRequestEffect', () => {

    it('should respond with success', () => {
      const study = factory.study();
      const action = StudyStoreActions.addStudyRequest({ study });
      const completion = StudyStoreActions.addStudySuccess({ study });
      spyOn(studyService, 'add').and.returnValue(of(study));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const study = factory.study();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = StudyStoreActions.addStudyRequest({ study });
      const completion = StudyStoreActions.addStudyFailure({ error });
      spyOn(studyService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('getStudyRequestEffect', () => {

    it('should respond with success', () => {
      const study = factory.study();
      const action = StudyStoreActions.getStudyRequest({ slug: study.slug });
      const completion = StudyStoreActions.getStudySuccess({ study });
      spyOn(studyService, 'get').and.returnValue(of(study));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const study = factory.study();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = StudyStoreActions.getStudyRequest({ slug: study.slug });
      const completion = StudyStoreActions.getStudyFailure({ error });
      spyOn(studyService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let study: Study;
    let action: Action;

    beforeEach(() => {
      study = factory.study();
      action = StudyStoreActions.updateStudyRequest({
        study,
        attributeName: 'name',
        value: factory.stringNext()
      });
      jest.spyOn(studyService, 'update');
    });

    it('should respond with success', () => {
      const completion = StudyStoreActions.updateStudySuccess({ study });

      jest.spyOn(studyService, 'update').mockReturnValue(of(study));
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
      const completion = StudyStoreActions.updateStudyFailure({ error });

      jest.spyOn(studyService, 'update').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('addOrUpdateAnnotationTypeRequestEffect', () => {

    let annotationType: AnnotationType;
    let study: Study;
    let action: Action;

    beforeEach(() => {
      annotationType = factory.annotationType();
      study = factory.study({ annotationTypes: [ annotationType ]});
      action = StudyStoreActions.updateStudyAddOrUpdateAnnotationTypeRequest({
        study,
        annotationType
      });
      jest.spyOn(studyService, 'addOrUpdateAnnotationType');
    });

    it('should respond with success', () => {
      const completion = StudyStoreActions.updateStudySuccess({ study });

      jest.spyOn(studyService, 'addOrUpdateAnnotationType').mockReturnValue(of(study));
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
      const completion = StudyStoreActions.updateStudyFailure({ error });

      jest.spyOn(studyService, 'addOrUpdateAnnotationType').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.addOrUpdateAnnotationTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeAnnotationTypeRequestEffect', () => {

    let annotationType: AnnotationType;
    let study: Study;
    let action: Action;

    beforeEach(() => {
      annotationType = factory.annotationType();
      study = factory.study({ annotationTypes: [ annotationType ]});
      action = StudyStoreActions.updateStudyRemoveAnnotationTypeRequest({
        study,
        annotationTypeId: annotationType.id
      });
      jest.spyOn(studyService, 'removeAnnotationType');
    });

    it('should respond with success', () => {
      const completion = StudyStoreActions.updateStudySuccess({ study });

      jest.spyOn(studyService, 'removeAnnotationType').mockReturnValue(of(study));
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
      const completion = StudyStoreActions.updateStudyFailure({ error });

      jest.spyOn(studyService, 'removeAnnotationType').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeAnnotationTypeRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('enableAllowedRequestEffect', () => {

    let study: Study;
    let action: Action;

    beforeEach(() => {
      study = factory.study();
      action = StudyStoreActions.getEnableAllowedRequest({ studyId: study.id });
      jest.spyOn(studyService, 'enableAllowed');
    });

    it('should respond with success', () => {
      const reply = {
        studyId: study.id,
        allowed: true
      };
      const completion = StudyStoreActions.getEnableAllowedSuccess(reply);

      jest.spyOn(studyService, 'enableAllowed').mockReturnValue(of(reply));
      actions = hot('--a-', { a: action });
      expect(effects.enableAllowedRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = StudyStoreActions.getEnableAllowedFailure({ error });

      jest.spyOn(studyService, 'enableAllowed').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.enableAllowedRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
