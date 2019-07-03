import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchParams, slugify } from '@app/domain';
import { NameFilter, SearchFilter } from '@app/domain/search-filters';
import { AuthStoreSelectors, ParticipantStoreActions, ParticipantStoreSelectors, RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';


@Component({
  selector: 'app-collection-page',
  templateUrl: './collection-page.component.html',
  styleUrls: ['./collection-page.component.scss']
})
export class CollectionPageComponent implements OnInit, OnDestroy {

  @ViewChild('participantCreateModal', { static: true }) participantCreateModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  haveCollectionStudies$: Observable<boolean>;
  validUser$: Observable<boolean>;
  hasNoMatches$: Observable<boolean>;
  currentPage = 1;
  studiesLimit = 5;
  form: FormGroup;
  participantLoading$ = new BehaviorSubject<boolean>(false);
  // participantLoading$ = new Subject<boolean>();

  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal) {
  }

  ngOnInit() {
    const searchParams = new SearchParams(null, null,  1, 5);
    this.store$.dispatch(StudyStoreActions.searchCollectionStudiesRequest({ searchParams }));
    this.isLoading$ = this.store$.pipe(select(StudyStoreSelectors.selectCollectionStudiesSearchActive));

    this.haveCollectionStudies$ = this.store$.pipe(
      select(StudyStoreSelectors.selectCollectionStudiesSearchRepliesAndEntities),
      filter(studies => studies !== undefined),
      map(studies => studies.length > 0),
      takeUntil(this.unsubscribe$));

    this.validUser$ = this.store$.pipe(
      select(AuthStoreSelectors.selectAuthUser),
      map(user => user.hasSpecimenCollectorRole()));

    this.store$.pipe(
      select(ParticipantStoreSelectors.selectAllParticipants),
      withLatestFrom(this.participantLoading$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ participants, loading]) => {
      if (!loading) { return ; }

      this.participantLoading$.next(false);
      const participant = participants.find(p => p.uniqueId === this.form.value.uniqueId);
      if (participant) {
        this.router.navigate([ participant.slug ], { relativeTo: this.route });
        return;
      }
      throw new Error('participant not found');
    });

    this.store$.pipe(
      select(ParticipantStoreSelectors.selectParticipantError),
      filter(error => !!error),
      withLatestFrom(this.participantLoading$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ _error, loading]) => {
      if (!loading) { return ; }

      this.modalService.open(this.participantCreateModal).result
        .then(() => {
          this.router.navigate([ `participant-add/${this.form.value.uniqueId}` ],
                               { relativeTo: this.route });
        })
        .catch(() => {
          this.uniqueId.setValue('');
          this.participantLoading$.next(false);
        });
    });

    this.form = this.formBuilder.group({ uniqueId: ['', Validators.required ] });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get uniqueId() {
    return this.form.get('uniqueId');
  }

  onSubmit(): void {
    this.store$.dispatch(
      ParticipantStoreActions.getParticipantRequest({ uniqueId: this.form.value.uniqueId }));
    this.participantLoading$.next(true);
  }

}
