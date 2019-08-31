import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudyResolver implements Resolve<Study> {
  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<Study> {
    const slug = route.paramMap.get('slug');

    this.store$.dispatch(StudyStoreActions.getStudyRequest({ slug }));

    return race<any>(
      this.store$.pipe(
        select(StudyStoreSelectors.selectStudyError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))),
      this.store$.pipe(
        select(StudyStoreSelectors.selectAllStudies),
        filter(s => s.length > 0),
        map((studies: Study[]) => {
          const study = studies.find(s => s.slug === slug);
          return study ? study : throwError('study not found');
        })))
      .pipe(take(1));
  }
}
