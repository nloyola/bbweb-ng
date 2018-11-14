import { Component, OnChanges, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, Study } from '@app/domain/studies';
import { CollectedSpecimenDefinition } from '@app/domain/studies/collected-specimen-definition.model';
import { ModalInputTextareaOptions, ModalInputTextOptions, ModalInputResult } from '@app/modules/modal-input/models';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { NgbModal, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { SpecimenDefinitionRemoveComponent } from '../specimen-definition-remove/specimen-definition-remove.component';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { SpecimenDefinitionViewComponent } from '../specimen-definition-view/specimen-definition-view.component';
import { EventTypeRemoveComponent } from '../event-type-remove/event-type-remove.component';

@Component({
  selector: 'app-event-type-view',
  templateUrl: './event-type-view.container.html'
})
export class EventTypeViewContainer implements OnInit, OnDestroy {

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
    this.study = this.route.parent.parent.snapshot.data.study;
    this.allowChanges = this.study.isDisabled();

    // check if the state of the study has changed
    this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudyEntities),
      filter((entities: { [key: string]: any }) => Object.keys(entities).length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: any) => {
        const entity = entities[this.study.id];
        const updatedStudy = (entity instanceof Study) ? entity : new Study().deserialize(entity);
        this.allowChanges = updatedStudy.isDisabled();
      });

    // checks to see if the user already selected an event type
    this.store$.pipe(
      select(EventTypeStoreSelectors.selectSelectedEventType),
      filter((et: CollectionEventType) => !!et),
      takeUntil(this.unsubscribe$))
      .subscribe((eventType: CollectionEventType) => {
        this.eventType = eventType;
      });

    // get latest updates to this event type from the store
    this.store$.pipe(
      select(EventTypeStoreSelectors.selectAllEventTypeEntities),
      filter((entities: { [key: string]: any }) => Object.keys(entities).length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: { [key: string]: any }) => {
        if (!this.eventType) { return; }

        const entity = entities[this.eventType.id];

        if (!entity) {
          // the event type was removed
          this.eventType = undefined;
          return;
        }

        this.eventType = (entity instanceof CollectionEventType)
          ? entity : new CollectionEventType().deserialize(entity);
        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage, 'Update Successfull');
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName() {
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
    this.modalService.open(this.updateRecurringModal, { size: 'lg' }).result
      .then(result => {
        if (result.confirmed) {
          this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
            eventType: this.eventType,
            attributeName: 'recurring',
            value: result.value
          }));
          this.updatedMessage = 'Recurring was updated';
        }
      })
      .catch(err => console.log('err', err));
  }

  addAnnotationType() {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ this.eventType.slug, 'annotationAdd' ],
                         { relativeTo: this.route });
  }

  viewAnnotationType(annotationType: AnnotationType): void {
    const modalRef = this.modalService.open(AnnotationTypeViewComponent, { size: 'lg' });
    modalRef.componentInstance.annotationType = annotationType;

    // nothing is done with this modal's result
    modalRef.result
      .then(() => undefined)
      .catch(() => undefined);
  }

  editAnnotationType($event: AnnotationType): void {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ this.eventType.slug, 'annotation', $event.id ],
                         { relativeTo: this.route });
  }

  removeAnnotationType($event: AnnotationType): void {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(AnnotationTypeRemoveComponent);
    modalRef.componentInstance.annotationType = $event;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRemoveAnnotationTypeRequest({
          eventType: this.eventType,
          annotationTypeId: $event.id
        }));

        this.updatedMessage = 'Annotation removed';
      })
      .catch(() => undefined);
  }

  addSpecimenDefinition() {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ this.eventType.slug, 'spcDefAdd' ], { relativeTo: this.route });
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
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ this.eventType.slug, 'spcDef', specimenDefinition.id ],
                         { relativeTo: this.route });
  }

  removeSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    if (!this.study.isDisabled()) {
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
    if (!this.study.isDisabled()) {
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

}
