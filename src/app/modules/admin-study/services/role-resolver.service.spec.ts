import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Role } from '@app/domain/access';
import { RoleStoreActions, RoleStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { RoleResolver } from './role-resolver.service';

describe('RoleResolver', () => {

  let ngZone: NgZone;
  let resolver: RoleResolver;
  let store: Store<RoleStoreReducer.State>;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'role': RoleStoreReducer.reducer
        })
      ]
    });

    ngZone = TestBed.get(NgZone);
    resolver = TestBed.get(RoleResolver);
    store = TestBed.get(Store);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should return a role', () => {
    const role = new Role().deserialize(factory.role());
    const route = new ActivatedRouteSnapshot();
    route.params = { slug: role.slug };
    const action = new RoleStoreActions.GetRoleSuccess({ role });
    store.dispatch(action);
    const expected = cold('(b|)', { b: role });
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
    const action = new RoleStoreActions.GetRoleFailure({ error });
    store.dispatch(action);
    const expected = cold('(b|)', {
      b: {
        error,
        actionType: RoleStoreActions.RoleActionTypes.GetRoleFailure
      }
    });
    ngZone.run(() => {
      expect(resolver.resolve(route, null)).toBeObservable(expected);
    });
  });

});
