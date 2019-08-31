import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '@app/domain/users';
import { RootStoreState, UserStoreActions, UserStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { UserResolver } from './user-resolver.service';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let store: Store<RootStoreState.State>;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(
          {
            user: UserStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
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
    store.dispatch(UserStoreActions.getUserSuccess({ user }));
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
    store.dispatch(UserStoreActions.getUserFailure({ error }));

    // the resolver will dispatch the getStudyRequest request action which clears an error,
    // to avoid the error getting cleared, we mock dispatch to do nothing
    jest.spyOn(store, 'dispatch').mockImplementationOnce(() => {});

    const expected = cold('(b|)', {
      b: {
        actionType: UserStoreActions.getUserFailure.type,
        error
      }
    });
    expect(resolver.resolve(route, null)).toBeObservable(expected);

    expect(routerListener.mock.calls.length).toBe(1);
  });
});
