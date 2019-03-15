import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, Study } from '@app/domain/studies';
import { CollectedSpecimenDefinition } from '@app/domain/studies/collected-specimen-definition.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, withLatestFrom, tap, share, filter } from 'rxjs/operators';
import { EventTypeRemoveComponent } from '../event-type-remove/event-type-remove.component';
import { SpecimenDefinitionRemoveComponent } from '../specimen-definition-remove/specimen-definition-remove.component';
import { SpecimenDefinitionViewComponent } from '../specimen-definition-view/specimen-definition-view.component';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { Dictionary } from '@ngrx/entity';

interface StoreData {
  study: Study;
  eventType: CollectionEventType;
  eventTypes: Dictionary<CollectionEventType>;
  allowChanges: boolean;
}

@Component({
  selector: 'app-event-type-view',
  templateUrl: './event-type-view.container.html'
})
export class EventTypeViewContainerComponent implements OnInit, OnDestroy {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;
  @ViewChild('updateRecurringModal') updateRecurringModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;
  allowChanges: boolean;
  eventType: CollectionEventType;

  private data$: Observable<StoreData>;
  private eventTypes: Dictionary<CollectionEventType>;
  private study: Study;
  private eventTypeId: string;
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {}

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.router.events.pipe(
      filter(x => x instanceof NavigationEnd),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      if (this.eventTypes === undefined) { return; }

      this.eventType = this.getEventType(this.route.snapshot.params.eventTypeSlug, this.eventTypes);

      if (!this.eventType) {
        this.store$.dispatch(new EventTypeStoreActions.GetEventTypeRequest({
          studySlug: this.route.parent.parent.parent.parent.snapshot.params.slug,
          eventTypeSlug: this.route.snapshot.params.eventTypeSlug
        }));
      }
    });

    const entitiesSelector = createSelector(
      StudyStoreSelectors.selectAllStudies,
      EventTypeStoreSelectors.selectAllEventTypeEntities,
      (studies: Study[], eventTypes: Dictionary<CollectionEventType>) => ({ studies, eventTypes }));

    this.data$ = this.store$.pipe(
      select(entitiesSelector),
      takeUntil(this.unsubscribe$),
      map((entities: any) => {
        let study: Study;

        const studyEntity = entities.studies
          .find((s: Study) => s.slug === this.route.parent.parent.parent.parent.snapshot.params.slug);
        if (studyEntity) {
          study = (studyEntity instanceof Study) ? studyEntity :  new Study().deserialize(studyEntity);
        }

        let eventType = this.getEventType(this.route.snapshot.params.eventTypeSlug, entities.eventTypes);
        if (eventType) {
          this.eventTypeId = eventType.id;
        } else if (this.eventTypeId) {
          // this only runs if the slug was changed or the was deleted
          const eventTypeEntityById = entities.eventTypes[this.eventTypeId];

          if (eventTypeEntityById) {
            eventType = (eventTypeEntityById instanceof CollectionEventType)
              ? eventTypeEntityById : new CollectionEventType().deserialize(eventTypeEntityById);
          }
        }

        return {
          study,
          eventType,
          eventTypes : entities.eventTypes,
          allowChanges: study ? study.isDisabled() : undefined
        };
      }),
      tap(data => {
        this.study = data.study;
        this.eventType = data.eventType;
        this.eventTypes = data.eventTypes;
        this.allowChanges = data.allowChanges;
      }),
      share());

    this.data$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ data, msg ]) => {
      this.toastr.success(msg, 'Update Successfull');

      if (data.eventType !== undefined) {
        if (data.eventType.slug !== this.route.snapshot.params.eventTypeSlug) {
          // name was changed and new slug was assigned
          //
          // need to change state since slug is used in URL and by breadcrumbs
          this.router.navigate([
            `/admin/studies/${data.study.slug}/collection/view/${data.eventType.slug}`]);
        }
      } else {
        this.router.navigate([ `/admin/studies/${data.study.slug}/collection/view` ]);
        this.eventType = undefined;
        this.eventTypeId = undefined;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    this.updateNameModalOptions = {
      required: true,
      minLength: 2
    };
    this.modalService.open(this.updateNameModal, { size: 'lg' }).result
      .then((value) => {
        this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
          eventType: this.eventType,
          attributeName: 'name',
          value
        }));
        this.updatedMessage$.next('Event name was updated');
      })
      .catch(() => undefined);
  }

  updateDescription() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    this.updateDescriptionModalOptions = {
      rows: 20,
      cols: 10
    };
    this.modalService.open(this.updateDescriptionModal, { size: 'lg' }).result
      .then((value: string) => {
        this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
          eventType: this.eventType,
          attributeName: 'description',
          value
        }));
        this.updatedMessage$.next('Event description was updated');
      })
      .catch(() => undefined);
  }

  updateRecurring() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    this.modalService.open(this.updateRecurringModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
          eventType: this.eventType,
          attributeName: 'recurring',
          value
        }));
        this.updatedMessage$.next('Recurring was updated');
      })
      .catch(() => undefined);
  }

  addAnnotationType() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ 'annotationAdd' ], { relativeTo: this.route });
  }

  viewAnnotationType(annotationType: AnnotationType): void {
    const modalRef = this.modalService.open(AnnotationTypeViewComponent, { size: 'lg' });
    modalRef.componentInstance.annotationType = annotationType;

    // nothing is done with this modal's result
    modalRef.result
      .then(() => undefined)
      .catch(() => undefined);
  }

  editAnnotationType(annotationType: AnnotationType): void {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ 'annotation', annotationType.id ], { relativeTo: this.route });
  }

  removeAnnotationType(annotationType: AnnotationType): void {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(AnnotationTypeRemoveComponent);
    modalRef.componentInstance.annotationType = annotationType;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRemoveAnnotationTypeRequest({
          eventType: this.eventType,
          annotationTypeId: annotationType.id
        }));

        this.updatedMessage$.next('Annotation removed');
      })
      .catch(() => undefined);
  }

  addSpecimenDefinition() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ 'spcDefAdd' ], { relativeTo: this.route });
  }

  viewSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    const modalRef = this.modalService.open(SpecimenDefinitionViewComponent, { size: 'lg' });
    modalRef.componentInstance.specimenDefinition = specimenDefinition;

    // nothing is done with this modal's result
    modalRef.result
      .then(() => undefined)
      .catch(() => undefined);
  }

  editSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ 'spcDef', specimenDefinition.id ], { relativeTo: this.route });
  }

  removeSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(SpecimenDefinitionRemoveComponent);
    modalRef.componentInstance.specimenDefinition = specimenDefinition;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRemoveSpecimenDefinitionRequest({
          eventType: this.eventType,
          specimenDefinitionId: specimenDefinition.id
        }));

        this.updatedMessage$.next('Specimen removed');
      })
      .catch(() => undefined);
  }

  removeEventType() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(EventTypeRemoveComponent);
    modalRef.componentInstance.eventType = this.eventType;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new EventTypeStoreActions.RemoveEventTypeRequest({
          eventType: this.eventType
        }));

        this.updatedMessage$.next('Event removed');
      })
      .catch(() => undefined);
  }

  addEventTypeSelected() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    // relative route does not work here, why?
    this.router.navigate([ `/admin/studies/${this.study.slug}/collection/add` ]);
  }

  eventTypeSelected(eventType: CollectionEventType) {
    this.eventType = eventType;
    // relative route does not work here, why?
    this.router.navigate([ `/admin/studies/${this.study.slug}/collection/${eventType.slug}` ]);
  }

  private getEventType(slug: string, eventTypes: Dictionary<CollectionEventType>): CollectionEventType {
    const eventTypeEntity = Object.values(eventTypes).find((et: CollectionEventType) => et.slug === slug);

    if (eventTypeEntity) {
      return (eventTypeEntity instanceof CollectionEventType)
        ? eventTypeEntity : new CollectionEventType().deserialize(eventTypeEntity as any);
    }
    return undefined;
  }

}
