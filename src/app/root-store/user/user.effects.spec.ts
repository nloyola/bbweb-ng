import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { UserStoreActions } from '@app/root-store';
import { Factory } from '@test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { UserStoreEffects } from './user.effects';
import { User } from '@app/domain/users';
import { Action } from '@ngrx/store';

describe('user-store effects', () => {

  let effects: UserStoreEffects;
  let actions: Observable<any>;
  let userService: UserService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UserStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(UserStoreEffects);
    userService = TestBed.get(UserService);
    factory = new Factory();
  });

  describe('getUserCountsRequestEffect', () => {

    it('should respond with success', () => {
      const userCounts = factory.userCounts();
      const action = new UserStoreActions.GetUserCountsRequest();
      const completion = new UserStoreActions.GetUserCountsSuccess({ userCounts });
      spyOn(userService, 'counts').and.returnValue(of(userCounts));

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
      const action = new UserStoreActions.GetUserCountsRequest();
      const completion = new UserStoreActions.GetUserCountsFailure({ error });
      spyOn(userService, 'counts').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.countsRequest$).toBeObservable(expected);
    });
  });

  describe('searchUsersRequestEffect', () => {

    it('should respond with success', () => {
      const searchParams = new SearchParams();
      const user = new User().deserialize(factory.user());
      const pagedReply = factory.pagedReply([ user ]);
      const action = new UserStoreActions.SearchUsersRequest({ searchParams });
      const completion = new UserStoreActions.SearchUsersSuccess({ pagedReply });
      spyOn(userService, 'search').and.returnValue(of(pagedReply));

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
      const action = new UserStoreActions.SearchUsersRequest({ searchParams });
      const completion = new UserStoreActions.SearchUsersFailure({ error });
      spyOn(userService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('getUserRequestEffect', () => {

    it('should respond with success', () => {
      const user = new User().deserialize(factory.user());
      const action = new UserStoreActions.GetUserRequest({ slug: user.slug });
      const completion = new UserStoreActions.GetUserSuccess({ user });
      spyOn(userService, 'get').and.returnValue(of(user));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const user = factory.user();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = new UserStoreActions.GetUserRequest({ slug: user.slug });
      const completion = new UserStoreActions.GetUserFailure({ error });
      spyOn(userService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let user: User;
    let action: Action;
    let userListener: any;

    beforeEach(() => {
      user = new User().deserialize(factory.user());
      action = new UserStoreActions.UpdateUserRequest({
        user,
        attributeName: 'name',
        value: factory.stringNext()
      });
      userListener = jest.spyOn(userService, 'update');
    });

    it('should respond with success', () => {
      const completion = new UserStoreActions.UpdateUserSuccess({ user });

      userListener.mockReturnValue(of(user));
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
      const completion = new UserStoreActions.UpdateUserFailure({ error });

      userListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
