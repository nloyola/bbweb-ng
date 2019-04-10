import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Membership } from '@app/domain/access';
import { RootStoreState, MembershipStoreActions, MembershipStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MembershipResolver implements Resolve<Membership> {
  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<Membership> {
    const slug = route.paramMap.get('slug');
    this.store$.dispatch(new MembershipStoreActions.GetMembershipRequest({ slug }));

    return race<any>(
      this.store$.pipe(
        select(MembershipStoreSelectors.selectMembershipError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))),
      this.store$.pipe(
        select(MembershipStoreSelectors.selectAllMemberships),
        filter(s => s.length > 0),
        map((memberships: Membership[]) => {
          const membership =  memberships.find(s => s.slug === slug);
          return membership ? membership : throwError('membership not found');
        })))
      .pipe(take(1));
  }
}
