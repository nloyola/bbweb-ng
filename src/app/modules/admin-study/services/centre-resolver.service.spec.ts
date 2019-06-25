import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Centre } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreReducer, NgrxRuntimeChecks, RootStoreState } from '@app/root-store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { CentreResolver } from './centre-resolver.service';

describe('CentreResolver', () => {

  let ngZone: NgZone;
  let resolver: CentreResolver;
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
            'centre': CentreStoreReducer.reducer
          },
          NgrxRuntimeChecks)
      ]
    });

    ngZone = TestBed.get(NgZone);
    resolver = TestBed.get(CentreResolver);
    store = TestBed.get(Store);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should return a centre', () => {
    const centre = new Centre().deserialize(factory.centre());
    const route = new ActivatedRouteSnapshot();
    route.params = { slug: centre.slug };
    const action = new CentreStoreActions.GetCentreSuccess({ centre });
    store.dispatch(action);
    const expected = cold('(b|)', { b: centre });
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
    const action = new CentreStoreActions.GetCentreFailure({ error });
    store.dispatch(action);
    const expected = cold('(b|)', {
      b: {
        error,
        actionType: CentreStoreActions.ActionTypes.GetCentreFailure
      }
    });
    ngZone.run(() => {
      expect(resolver.resolve(route, null)).toBeObservable(expected);
    });
  });

});
