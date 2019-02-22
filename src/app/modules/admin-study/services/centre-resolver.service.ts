import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Centre } from '@app/domain/centres';
import { RootStoreState, CentreStoreActions, CentreStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CentreResolver implements Resolve<Centre> {
  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<Centre> {
    const slug = route.paramMap.get('slug');
    this.store$.dispatch(new CentreStoreActions.GetCentreRequest({ slug }));

    return race<any>(
      this.store$.pipe(
        select(CentreStoreSelectors.selectCentreError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))),
      this.store$.pipe(
        select(CentreStoreSelectors.selectAllCentres),
        filter(s => s.length > 0),
        map((centres: Centre[]) => centres.find(s => s.slug === slug)),
        map(centre => {
          if (!centre) {
            return throwError('centre not found');
          }

          // have to do the following because of this issue:
          //
          // https://github.com/ngrx/platform/issues/976
          return (centre instanceof Centre) ? centre :  new Centre().deserialize(centre);
        })))
      .pipe(take(1));
  }
}
