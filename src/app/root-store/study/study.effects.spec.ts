import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService, StudyService } from '@app/core/services';
import { StudyStoreActions } from '@app/root-store';
import { Factory } from '@app/test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { StudyStoreEffects } from './study.effects';
import { SearchParams } from '@app/domain';

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
      const action = new StudyStoreActions.GetStudyCountsRequest();
      const completion = new StudyStoreActions.GetStudyCountsSuccess({ studyCounts });
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
      const action = new StudyStoreActions.GetStudyCountsRequest();
      const completion = new StudyStoreActions.GetStudyCountsFailure({ error });
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
      const action = new StudyStoreActions.SearchStudiesRequest({ searchParams });
      const completion = new StudyStoreActions.SearchStudiesSuccess({ pagedReply });
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
      const action = new StudyStoreActions.SearchStudiesRequest({ searchParams });
      const completion = new StudyStoreActions.SearchStudiesFailure({ error });
      spyOn(studyService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('addStudyRequestEffect', () => {

    it('should respond with success', () => {
      const study = factory.study();
      const action = new StudyStoreActions.AddStudyRequest({ study });
      const completion = new StudyStoreActions.AddStudySuccess({ study });
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
      const action = new StudyStoreActions.AddStudyRequest({ study });
      const completion = new StudyStoreActions.AddStudyFailure({ error });
      spyOn(studyService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('getStudyRequestEffect', () => {

    it('should respond with success', () => {
      const study = factory.study();
      const action = new StudyStoreActions.GetStudyRequest({ slug: study.slug });
      const completion = new StudyStoreActions.GetStudySuccess({ study });
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
      const action = new StudyStoreActions.GetStudyRequest({ slug: study.slug });
      const completion = new StudyStoreActions.GetStudyFailure({ error });
      spyOn(studyService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

});
