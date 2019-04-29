import { Component, OnInit, OnDestroy } from '@angular/core';
import { ParticipantStoreSelectors, StudyStoreSelectors, RootStoreState, StudyStoreActions } from '@app/root-store';
import { createSelector, Store, select } from '@ngrx/store';
import { Study } from '@app/domain/studies';
import { Participant } from '@app/domain/participants';
import { Observable, Subject, throwError } from 'rxjs';
import { map, takeUntil, shareReplay, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-participant-view-page',
  templateUrl: './participant-view-page.component.html',
  styleUrls: ['./participant-view-page.component.scss']
})
export class ParticipantViewPageComponent implements OnInit, OnDestroy {

  participant$: Observable<Participant>;

  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.participant$ = this.store$.pipe(
      select(ParticipantStoreSelectors.selectAllParticipants),
      map(participants => participants.find(p => p.slug === this.route.snapshot.params.slug)),
      takeUntil(this.unsubscribe$),
      shareReplay());
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
