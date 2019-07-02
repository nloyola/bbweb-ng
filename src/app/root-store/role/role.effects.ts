import { Injectable } from '@angular/core';
import { RoleService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as RoleActions from './role.actions';

@Injectable()
export class RoleStoreEffects {

  constructor(private actions$: Actions<RoleActions.RoleActionsUnion>,
              private roleService: RoleService) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(RoleActions.getRoleRequest.type),
    switchMap(
      action =>
        this.roleService.get(action.slug)
        .pipe(
          map(role => RoleActions.getRoleSuccess({ role })),
          catchError(error => observableOf(RoleActions.getRoleFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(RoleActions.searchRolesRequest.type),
    switchMap(
      action =>
        this.roleService.search(action.searchParams)
        .pipe(
          map(pagedReply => RoleActions.searchRolesSuccess({ pagedReply })),
          catchError(error => observableOf(RoleActions.searchRolesFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(RoleActions.updateRoleRequest.type),
    switchMap(
      action =>
        this.roleService.update(action.role, action.attributeName, action.value)
        .pipe(
          map(role => RoleActions.updateRoleSuccess({ role })),
          catchError(error => observableOf(RoleActions.updateRoleFailure({ error }))))
    )
  );

}
