import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, Study } from '@app/domain/studies';
import { CollectedSpecimenDefinition } from '@app/domain/studies/collected-specimen-definition.model';
import { ModalInputResult, ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modal-input/models';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventTypeRemoveComponent } from '../event-type-remove/event-type-remove.component';
import { SpecimenDefinitionRemoveComponent } from '../specimen-definition-remove/specimen-definition-remove.component';
import { SpecimenDefinitionViewComponent } from '../specimen-definition-view/specimen-definition-view.component';

@Component({
  selector: 'app-event-type-view',
  templateUrl: './event-type-view.container.html'
})
export class EventTypeViewContainerComponent implements OnInit, OnDestroy {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;
  @ViewChild('updateRecurringModal') updateRecurringModal: TemplateRef<any>;

  eventType: CollectionEventType;
  study: Study;
  allowChanges: boolean;
  isAddingAnnotation = false;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;

  private updatedMessage: string;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {}

  ngOnInit() {
    const entitiesSelector = createSelector(
      StudyStoreSelectors.selectAllStudies,
      EventTypeStoreSelectors.selectAllEventTypes,
      (studies: Study[], eventTypes: CollectionEventType[]) => {
        return { studies, eventTypes };
      });

    this.store$.pipe(
      select(entitiesSelector),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: any) => {
        const studyEntity = entities.studies
          .find((s: Study) => s.slug === this.route.parent.parent.parent.parent.snapshot.params.slug);
        if (studyEntity) {
          this.study = (studyEntity instanceof Study)
            ? studyEntity :  new Study().deserialize(studyEntity);
          this.allowChanges = this.study.isDisabled();
        }

        const eventTypeEntity = entities.eventTypes
          .find((et: CollectionEventType) => et.slug === this.route.snapshot.params.eventTypeSlug);

        if (eventTypeEntity) {
          this.eventType = (eventTypeEntity instanceof CollectionEventType)
            ? eventTypeEntity : new CollectionEventType().deserialize(eventTypeEntity);
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
          }
          return;
        }

        if (!this.eventType) { return; }

        // this only runs if the slug was changed or the was deleted
        const eventTypeEntityById = entities.eventTypes
          .find((et: CollectionEventType) => et.id === this.eventType.id);

        if (eventTypeEntityById) {
          this.eventType = (eventTypeEntityById instanceof CollectionEventType)
            ? eventTypeEntityById : new CollectionEventType().deserialize(eventTypeEntityById);
          this.router.navigate([ `/admin/studies/view/bbpsp/collection/view/${eventTypeEntityById.slug}` ]);
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
          }
          return;
        }

        this.eventType = undefined;
        this.router.navigate([ '/admin/studies/view/bbpsp/collection/view' ]);
        this.toastr.success('Event removed');
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
      .then((result: ModalInputResult) => {
        if (result.confirmed) {
          this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
            eventType: this.eventType,
            attributeName: 'name',
            value: result.value
          }));
          this.updatedMessage = 'Event name was updated';
        }
      })
      .catch(err => console.log('err', err));
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
      .then((result: ModalInputResult) => {
        if (result.confirmed) {
          this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
            eventType: this.eventType,
            attributeName: 'description',
            value: result.value
          }));
          this.updatedMessage = 'Event description was updated';
        }
      })
      .catch(err => console.log('err', err));
  }

  updateRecurring() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    this.modalService.open(this.updateRecurringModal, { size: 'lg' }).result
      .then(result => {
        if (result.confirmed) {
          this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
            eventType: this.eventType,
            attributeName: 'recurring',
            value: result.value.toString()
          }));
          this.updatedMessage = 'Recurring was updated';
        }
      })
      .catch(err => console.log('err', err));
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

        this.updatedMessage = 'Annotation removed';
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

        this.updatedMessage = 'Specimen removed';
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

        this.updatedMessage = 'Event removed';
      })
      .catch(() => undefined);
  }

  addEventTypeSelected() {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    // relative route does not work here, why?
    this.router.navigate([ '/admin/studies/view/bbpsp/collection/add' ]);
  }

  eventTypeSelected(eventType: CollectionEventType) {
    this.eventType = eventType;
    // relative route does not work here, why?
    this.router.navigate([ `/admin/studies/view/bbpsp/collection/${eventType.slug}` ]);
  }

}
