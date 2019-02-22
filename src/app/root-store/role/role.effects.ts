import { Injectable } from '@angular/core';
import { RoleService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as RoleActions from './role.actions';

@Injectable()
export class RoleStoreEffects {

  constructor(private actions$: Actions<RoleActions.RoleActions>,
              private roleService: RoleService) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(RoleActions.RoleActionTypes.GetRoleRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.roleService.get(payload.slug)
        .pipe(
          map(role => new RoleActions.GetRoleSuccess({ role })),
          catchError(error => observableOf(new RoleActions.GetRoleFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(RoleActions.RoleActionTypes.SearchRolesRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.roleService.search(payload.searchParams)
        .pipe(
          map(pagedReply => new RoleActions.SearchRolesSuccess({ pagedReply })),
          catchError(error => observableOf(new RoleActions.SearchRolesFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(RoleActions.RoleActionTypes.UpdateRoleRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.roleService.update(payload.role, payload.attributeName, payload.value)
        .pipe(
          map(role => new RoleActions.UpdateRoleSuccess({ role })),
          catchError(error => observableOf(new RoleActions.UpdateRoleFailure({ error }))))
    )
  );

}
