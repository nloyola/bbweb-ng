import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed, flush, fakeAsync } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '@app/domain/users';
import { UserStoreActions, UserStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { UserResolver } from './user-resolver.service';

describe('UserResolver', () => {

  let resolver: UserResolver;
  let store: Store<UserStoreReducer.State>;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'user': UserStoreReducer.reducer
        })
      ]
    });

    resolver = TestBed.get(UserResolver);
    store = TestBed.get(Store);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should return a user', () => {
    const user = new User().deserialize(factory.user());
    const route = new ActivatedRouteSnapshot();
    route.params = { slug: user.slug };
    store.dispatch(new UserStoreActions.GetUserSuccess({ user }));
    const expected = cold('(b|)', { b: user });
    expect(resolver.resolve(route, null)).toBeObservable(expected);
  });

  it('should handle an error response', () => {
    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const route = new ActivatedRouteSnapshot();
    route.params = { slug: 'test' };
    resolver.resolve(route, null);

    const error = {
      error: { message: 'simulated error' },
      status: 404
    };
    store.dispatch(new UserStoreActions.GetUserFailure({ error }));
    jest.spyOn(store, 'dispatch').mockImplementationOnce(() => {});
    const expected = cold('(b|)', {
      b: {
        actionType: UserStoreActions.UserActionTypes.GetUserFailure,
        error
      }
    });
    expect(resolver.resolve(route, null)).toBeObservable(expected);

    expect(routerListener.mock.calls.length).toBe(1);
  });

});
