import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { RootStoreState, ParticipantStoreActions, ParticipantStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { Participant } from '@app/domain/participants';

@Injectable({
  providedIn: 'root'
})
export class ParticipantResolver implements Resolve<Participant> {
  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<Participant> {
    const slug = route.paramMap.get('slug');

    this.store$.dispatch(ParticipantStoreActions.getParticipantRequest({ slug }));

    return race<any>(
      this.store$.pipe(
        select(ParticipantStoreSelectors.selectParticipantError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))),
      this.store$.pipe(
        select(ParticipantStoreSelectors.selectAllParticipants),
        filter(s => s.length > 0),
        map((participants: Participant[]) => {
          const participant = participants.find(s => s.slug === slug);
          return participant ? participant : throwError('participant not found');
        })))
      .pipe(take(1));
  }
}
