import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectedSpecimenDefinition, CollectionEventType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { select, Store, createSelector } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { filter, takeUntil, map, tap, shareReplay, withLatestFrom } from 'rxjs/operators';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';

interface StoreData {
  study: Study;
  eventType: CollectionEventType;
  specimenDefinition: CollectedSpecimenDefinition;
}

@Component({
  selector: 'app-collected-specimen-definition-add',
  templateUrl: './collected-specimen-definition-add.container.html'
})
export class CollectedSpecimenDefinitionAddContainerComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  data$: Observable<StoreData>;
  eventType: CollectionEventType;
  specimenDefinition$: Observable<CollectedSpecimenDefinition>;
  isSaving$ = new BehaviorSubject<boolean>(false);

  private parentStateRelativePath = '..';
  private specimenDefinition: CollectedSpecimenDefinition;
  private specimenDefinitionToSave: CollectedSpecimenDefinition;
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store$: Store<RootStoreState.State>,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    const entitiesSelector = createSelector(
      StudyStoreSelectors.selectAllStudies,
      EventTypeStoreSelectors.selectAllEventTypes,
      (studies: Study[], eventTypes: CollectionEventType[]) => ({ studies, eventTypes }));

    this.data$ = this.store$.pipe(
      select(entitiesSelector),
      map(data => {
        let study: Study;
        let eventType: CollectionEventType;
        let specimenDefinition: CollectedSpecimenDefinition;

        const studyEntity = data.studies
          .find(s => s.slug === this.route.parent.parent.parent.parent.snapshot.params.slug);

        if (studyEntity) {
          study = (studyEntity instanceof Study) ? studyEntity :  new Study().deserialize(studyEntity);
        }

        const etEntity = data.eventTypes.find(et => et.slug === this.route.snapshot.params.eventTypeSlug);
        if (etEntity) {
          eventType = (etEntity instanceof CollectionEventType)
            ? etEntity : new CollectionEventType().deserialize(etEntity);
          specimenDefinition = this.route.snapshot.params.specimenDefinitionId
            ? eventType.specimenDefinitions.find(
              at => at.id === this.route.snapshot.params.specimenDefinitionId)
            : new CollectedSpecimenDefinition();
        }

        return {
          study,
          eventType,
          specimenDefinition
        };
      }),
      tap(data => {
        this.eventType = data.eventType;
        this.specimenDefinition = data.specimenDefinition;
      }),
      shareReplay());

    this.specimenDefinition$ = this.data$.pipe(map(data => data.specimenDefinition));

    this.data$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ _data, msg ]) => {
      this.isSaving$.next(false);
      this.toastr.success(msg, 'Update Successfull');
      this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
    });

    this.store$
      .pipe(
        select(EventTypeStoreSelectors.selectError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        this.isSaving$.next(false);
        let errMessage = error.error ? error.error.message : error.statusText;
        if (errMessage && errMessage.match(/EntityCriteriaError.*name already used/)) {
          errMessage = `The name is already in use: ${this.specimenDefinitionToSave.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });

    this.store$.dispatch(new EventTypeStoreActions.GetEventTypeRequest({
      studySlug: this.route.parent.parent.parent.parent.snapshot.params.slug,
      eventTypeSlug: this.route.snapshot.params.eventTypeSlug
    }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(specimenDefinition: CollectedSpecimenDefinition): void {
    this.isSaving$.next(true);
    this.specimenDefinitionToSave = specimenDefinition;

    this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest({
      eventType: this.eventType,
      specimenDefinition: this.specimenDefinitionToSave
    }));

    this.updatedMessage$.next(this.specimenDefinition.isNew() ? 'Specimen Added' : 'Specimen Updated');
  }

  onCancel(): void {
    this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
  }

}
