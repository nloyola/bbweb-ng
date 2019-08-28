import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { StudyResolver } from './study-resolver.service';

describe('StudyResolver', () => {

  let ngZone: NgZone;
  let resolver: StudyResolver;
  let store: Store<RootStoreState.State>;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'study': StudyStoreReducer.reducer
          },
          NgrxRuntimeChecks)
      ]
    });

    ngZone = TestBed.get(NgZone);
    resolver = TestBed.get(StudyResolver);
    store = TestBed.get(Store);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should return a study', () => {
    const study = new Study().deserialize(factory.study());
    const route = new ActivatedRouteSnapshot();
    route.params = { slug: study.slug };
    const action = StudyStoreActions.getStudySuccess({ study });
    store.dispatch(action);
    const expected = cold('(b|)', { b: study });
    expect(resolver.resolve(route, null)).toBeObservable(expected);
  });

  it('should handle an error response', () => {
    const error = {
      error: {
        message: 'simulated error'
      },
      status: 404
    };
    const route = new ActivatedRouteSnapshot();
    route.params = { slug: 'test' };
    const action = StudyStoreActions.getStudyFailure({ error });
    const expected = cold('(b|)', {
      b: {
        error,
        actionType: StudyStoreActions.getStudyFailure.type
      }
    });
    store.dispatch(action);

    // the resolver will dispatch the getStudyRequest request action which clears an error,
    // to avoid the error getting cleared, we mock dispatch to do nothing
    jest.spyOn(store, 'dispatch').mockImplementationOnce(() => {});

    ngZone.run(() => {
      expect(resolver.resolve(route, null)).toBeObservable(expected);
    });
  });

});
