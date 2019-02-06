import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectedSpecimenDefinition, CollectionEventType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject, BehaviorSubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-collected-specimen-definition-add',
  templateUrl: './collected-specimen-definition-add.container.html'
})
export class CollectedSpecimenDefinitionAddContainerComponent implements OnInit, OnDestroy {

  study: Study;
  eventTypeSlug: string;
  eventType: CollectionEventType;
  loading: boolean;
  specimenDefinition: CollectedSpecimenDefinition;
  isSaving$ = new BehaviorSubject<boolean>(false);
  savedMessage: string;

  private parentStateRelativePath = '..';
  private specimenDefinitionToSave: CollectedSpecimenDefinition;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store$: Store<RootStoreState.State>,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.specimenDefinition = new CollectedSpecimenDefinition();
    this.loading = (this.route.snapshot.url[0].path !== 'spcDefAdd');
    this.study = this.route.parent.parent.parent.parent.snapshot.data.study;
    this.eventTypeSlug = this.route.snapshot.params.eventTypeSlug;

    this.store$.pipe(
      select(EventTypeStoreSelectors.selectAllEventTypes),
      filter((eventTypes: CollectionEventType[]) => eventTypes.length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((eventTypes: CollectionEventType[]) => {
        const entity = eventTypes.find(et => et.slug === this.route.snapshot.params.eventTypeSlug);
        this.eventType = (entity instanceof CollectionEventType)
          ? entity : new CollectionEventType().deserialize(entity);

        this.loading = false;

        if (this.route.snapshot.params.specimenDefinitionId) {
          this.parentStateRelativePath = '../..';
          this.specimenDefinition = this.eventType.specimenDefinitions
            .find(sd => sd.id === this.route.snapshot.params.specimenDefinitionId);
        }

        if (this.savedMessage) {
          this.isSaving$.next(false);
          this.toastr.success(this.savedMessage, 'Update Successfull');
          this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
        }
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
        this.savedMessage = undefined;
      });

    this.store$.dispatch(new EventTypeStoreActions.GetEventTypeRequest({
      studySlug: this.study.slug,
      eventTypeSlug: this.eventTypeSlug
    }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(specimenDefinition: CollectedSpecimenDefinition): void {
    this.isSaving$.next(true);
    this.specimenDefinitionToSave = specimenDefinition;
    this.savedMessage = this.specimenDefinition.isNew() ? 'Specimen Added' : 'Specimen Updated';

    this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest({
      eventType: this.eventType,
      specimenDefinition: this.specimenDefinitionToSave
    }));
  }

  onCancel(): void {
    this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
  }

}
