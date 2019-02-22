import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { User } from '@app/domain/users';
import { RootStoreState, UserStoreActions, UserStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<User> {
  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<User> {
    const slug = route.paramMap.get('slug');
    this.store$.dispatch(new UserStoreActions.GetUserRequest({ slug }));

    return race<any>(
      this.store$.pipe(
        select(UserStoreSelectors.selectUserError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))),
      this.store$.pipe(
        select(UserStoreSelectors.selectAllUsers),
        filter(s => s.length > 0),
        map((users: User[]) => users.find(s => s.slug === slug)),
        map(user => {
          if (!user) {
            return throwError('user not found');
          }

          // have to do the following because of this issue:
          //
          // https://github.com/ngrx/platform/issues/976
          return (user instanceof User) ? user :  new User().deserialize(user);
        })))
      .pipe(take(1));
  }
}
