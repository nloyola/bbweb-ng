import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchParams } from '@app/domain';
import { Participant } from '@app/domain/participants';
import { Study } from '@app/domain/studies';
import {
  ParticipantStoreActions,
  RootStoreState,
  StudyStoreActions,
  StudyStoreSelectors,
  ParticipantStoreSelectors
} from '@app/root-store';
import { select, Store, createSelector } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { filter, withLatestFrom, takeUntil, tap, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-participant-add-page',
  templateUrl: './participant-add-page.component.html',
  styleUrls: ['./participant-add-page.component.scss']
})
export class ParticipantAddPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  collectionStudies$: Observable<Study[]>;
  uniqueId$: Observable<string>;
  isSaving$ = new BehaviorSubject<boolean>(false);
  participantToAdd: Participant;

  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(StudyStoreSelectors.selectCollectionStudiesSearchActive));
    this.uniqueId$ = this.route.params.pipe(map(params => (params ? params['uniqueId'] : undefined)));

    const studiesSelector = createSelector(
      StudyStoreSelectors.selectCollectionStudiesSearchRepliesAndEntities,
      StudyStoreSelectors.selectAllStudies,
      (collectionStudies: Study[], studies: Study[]) => ({ collectionStudies, studies })
    );

    this.collectionStudies$ = this.store$.pipe(
      select(studiesSelector),
      filter(data => data.collectionStudies !== undefined),
      tap(data => {
        if (data.collectionStudies.length <= 0) {
          this.router.navigate(['/server-error']);
        }
      }),
      map(data => data.collectionStudies)
    );

    this.store$
      .pipe(
        select(ParticipantStoreSelectors.selectParticipantLastAdded),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([participant, msg]) => {
        this.isSaving$.next(false);
        this.toastr.success(msg, 'Add Successful');
        this.router.navigate([`../../${participant.slug}`], { relativeTo: this.route });
      });

    this.store$
      .pipe(
        select(ParticipantStoreSelectors.selectParticipantError),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage && errMessage.match(/participant with unique ID already exists/)) {
          errMessage = `A participant with the ID ${this.participantToAdd.uniqueId} already exits.`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });

    const searchParams = {
      page: 1,
      limit: 5
    };
    this.store$.dispatch(StudyStoreActions.searchCollectionStudiesRequest({ searchParams }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  studySelected(slug: string): void {
    this.store$.dispatch(StudyStoreActions.getStudyRequest({ slug }));
  }

  onSubmit(participant: Participant): void {
    this.participantToAdd = participant;
    this.isSaving$.next(true);
    this.store$.dispatch(ParticipantStoreActions.addParticipantRequest({ participant }));
    this.updatedMessage$.next('Participant Added');
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
