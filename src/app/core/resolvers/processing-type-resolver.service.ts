import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { ProcessingType } from '@app/domain/studies';
import { ProcessingTypeStoreSelectors, ProcessingTypeStoreActions } from '@app/root-store/processing-type';

@Injectable({
  providedIn: 'root'
})
export class ProcessingTypeResolver implements Resolve<ProcessingType> {
  constructor(private store$: Store<RootStoreState.State>, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<ProcessingType> {
    const studySlug = route.parent.parent.parent.paramMap.get('slug');
    const processingTypeSlug = route.paramMap.get('processingTypeSlug');

    this.store$.dispatch(
      new ProcessingTypeStoreActions.GetProcessingTypeRequest({ studySlug, processingTypeSlug })
    );

    return race<any>(
      this.store$.pipe(
        select(ProcessingTypeStoreSelectors.selectError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))
      ),
      this.store$.pipe(
        select(ProcessingTypeStoreSelectors.selectAllProcessingTypes),
        filter(ets => ets.length > 0),
        map((ets: ProcessingType[]) => {
          const processingType = ets.find(et => et.slug === processingTypeSlug);
          return processingType ? processingType : throwError('processing type not found');
        })
      )
    ).pipe(take(1));
  }
}
