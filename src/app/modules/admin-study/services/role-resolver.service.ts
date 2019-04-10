import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Role } from '@app/domain/access';
import { RootStoreState, RoleStoreActions, RoleStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleResolver implements Resolve<Role> {
  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<Role> {
    const slug = route.paramMap.get('slug');
    this.store$.dispatch(new RoleStoreActions.GetRoleRequest({ slug }));

    return race<any>(
      this.store$.pipe(
        select(RoleStoreSelectors.selectRoleError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))),
      this.store$.pipe(
        select(RoleStoreSelectors.selectAllRoles),
        filter(s => s.length > 0),
        map((roles: Role[]) => {
          const role =roles.find(s => s.slug === slug);
          return role ? role : throwError('role not found');
        })))
      .pipe(take(1));
  }
}
