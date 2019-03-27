import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '@app/domain/users';
import { UserStoreActions, UserStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { UserResolver } from './user-resolver.service';

describe('UserResolver', () => {

  let ngZone: NgZone;
  let resolver: UserResolver;
  let store: Store<UserStoreReducer.State>;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'user': UserStoreReducer.reducer
        })
      ]
    });

    ngZone = TestBed.get(NgZone);
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
    const action = new UserStoreActions.GetUserSuccess({ user });
    store.dispatch(action);
    const expected = cold('(b|)', { b: user });
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
    const action = new UserStoreActions.GetUserFailure({ error });
    store.dispatch(action);
    const expected = cold('(b|)', {
      b: {
        error,
        actionType: UserStoreActions.UserActionTypes.GetUserFailure
      }
    });
    ngZone.run(() => {
      expect(resolver.resolve(route, null)).toBeObservable(expected);
    });
  });

});
