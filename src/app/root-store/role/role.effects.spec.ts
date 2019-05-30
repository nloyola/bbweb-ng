import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RoleService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { RoleStoreActions } from '@app/root-store';
import { Factory } from '@test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { RoleStoreEffects } from './role.effects';
import { Role } from '@app/domain/access';
import { Action } from '@ngrx/store';

describe('role-store effects', () => {

  let effects: RoleStoreEffects;
  let actions: Observable<any>;
  let roleService: RoleService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        RoleStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(RoleStoreEffects);
    roleService = TestBed.get(RoleService);
    factory = new Factory();
  });

  describe('searchRolesRequestEffect', () => {

    it('should respond with success', () => {
      const searchParams = new SearchParams();
      const role = new Role().deserialize(factory.role());
      const pagedReply = factory.pagedReply([ role ]);
      const action = new RoleStoreActions.SearchRolesRequest({ searchParams });
      const completion = new RoleStoreActions.SearchRolesSuccess({ pagedReply });
      spyOn(roleService, 'search').and.returnValue(of(pagedReply));

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
      const action = new RoleStoreActions.SearchRolesRequest({ searchParams });
      const completion = new RoleStoreActions.SearchRolesFailure({ error });
      spyOn(roleService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('getRoleRequestEffect', () => {

    it('should respond with success', () => {
      const role = new Role().deserialize(factory.role());
      const action = new RoleStoreActions.GetRoleRequest({ slug: role.slug });
      const completion = new RoleStoreActions.GetRoleSuccess({ role });
      spyOn(roleService, 'get').and.returnValue(of(role));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const role = factory.role();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = new RoleStoreActions.GetRoleRequest({ slug: role.slug });
      const completion = new RoleStoreActions.GetRoleFailure({ error });
      spyOn(roleService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let role: Role;
    let action: Action;
    let roleListener: any;

    beforeEach(() => {
      role = new Role().deserialize(factory.role());
      action = new RoleStoreActions.UpdateRoleRequest({
        role,
        attributeName: 'userAdd',
        value: factory.stringNext()
      });
      roleListener = jest.spyOn(roleService, 'update');
    });

    it('should respond with success', () => {
      const completion = new RoleStoreActions.UpdateRoleSuccess({ role });

      roleListener.mockReturnValue(of(role));
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
      const completion = new RoleStoreActions.UpdateRoleFailure({ error });

      roleListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
