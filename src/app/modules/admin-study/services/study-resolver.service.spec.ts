import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NgZone } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Study } from "@app/domain/studies";
import { StudyStoreActions, StudyStoreReducer } from "@app/root-store";
import { Factory } from "@app/test/factory";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Store, StoreModule } from "@ngrx/store";
import { cold } from 'jasmine-marbles';
import { StudyResolver } from "./study-resolver.service";

describe('StudyResolver', () => {

  let ngZone: NgZone;
  let resolver: StudyResolver;
  let store: Store<StudyStoreReducer.State>;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgbModule.forRoot(),
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer
        })
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
    const action = new StudyStoreActions.GetStudySuccess({ study });
    store.dispatch(action);
    const expected = cold('(b|)', { b: study });
    expect(resolver.resolve(route, null)).toBeObservable(expected);
  });

  it('should return a study', () => {
    const error = {
      error: {
        message: 'simulated error'
      },
      status: 404
    };
    const route = new ActivatedRouteSnapshot();
    route.params = { slug: 'test' };
    const action = new StudyStoreActions.GetStudyFailure({ error });
    store.dispatch(action);
    const expected = cold('(b|)', {
      b: {
        error,
        type: StudyStoreActions.ActionTypes.GetStudyFailure
      }
    });
    ngZone.run(() => {
      expect(resolver.resolve(route, null)).toBeObservable(expected);
    });
  });

});
