import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { RootStoreState, EventStoreSelectors, EventStoreActions } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { CollectionEvent } from '@app/domain/participants';

@Injectable({
  providedIn: 'root'
})
export class CollectionEventResolver implements Resolve<CollectionEvent> {
  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<CollectionEvent> {
    const participant = route.parent.parent.parent.data.participant;
    const visitNumber = +route.paramMap.get('visitNumber');

    this.store$.dispatch(EventStoreActions.getEventRequest({ participant, visitNumber }));

    return race<any>(
      this.store$.pipe(
        select(EventStoreSelectors.selectCollectionEventError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))),
      this.store$.pipe(
        select(EventStoreSelectors.selectAllCollectionEvents),
        filter(s => s.length > 0),
        map((collectionEvents: CollectionEvent[]) => {
          const collectionEvent = collectionEvents.find(e => e.visitNumber === visitNumber);
          if (collectionEvent === undefined) {
            return throwError('collection event not found');
          }
          return (collectionEvent instanceof CollectionEvent)
            ? collectionEvent : new CollectionEvent().deserialize(collectionEvent);
        })))
      .pipe(take(1));
  }
}
