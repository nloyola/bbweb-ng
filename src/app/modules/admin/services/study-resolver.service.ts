import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { Study } from '@app/domain/studies';
import {
  RootStoreState,
  StudyStoreActions,
  StudyStoreSelectors
} from '@app/root-store';

@Injectable({
  providedIn: 'root'
})
export class StudyResolver implements Resolve<Study> {
  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Study> {
    const slug = route.paramMap.get('slug');

    this.store$.dispatch(new StudyStoreActions.GetStudyRequest({ slug }));

    return this.store$.pipe(
      select(StudyStoreSelectors.selectStudyBySlug, { slug }),
      filter(s => !!s),
      take(1));
  }
}
