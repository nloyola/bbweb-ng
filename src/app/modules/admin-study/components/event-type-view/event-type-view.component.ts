import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, SpecimenDefinition, Study } from '@app/domain/studies';
import { CollectedSpecimenDefinition } from '@app/domain/studies/collected-specimen-definition.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modal-input/models';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState } from '@app/root-store';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { EventTypeRemoveComponent } from '../event-type-remove/event-type-remove.component';
import { SpecimenDefinitionViewComponent } from '../specimen-definition-view/specimen-definition-view.component';
import { SpecimenDefinitionRemoveComponent } from '../specimen-definition-remove/specimen-definition-remove.component';

@Component({
  selector: 'app-event-type-view',
  templateUrl: './event-type-view.component.html',
  styleUrls: ['./event-type-view.component.scss']
})
export class EventTypeViewComponent implements OnInit, OnChanges, OnDestroy {


  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;

  eventType: CollectionEventType;
  isPanelCollapsed = false;
  study: Study;
  allowChanges: boolean;
  isAddingAnnotation = false;
  sortedAnnotationTypes: AnnotationType[];
  sortedSpecimenDefinitions: SpecimenDefinition[];
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
    this.setSortedAnnotationTypes();
    this.setSoredSpecimenDefinitions();

    // checks to see if the user already selected an event type
    this.store$.pipe(
      select(EventTypeStoreSelectors.selectSelectedEventType),
      filter((et: CollectionEventType) => !!et),
      takeUntil(this.unsubscribe$))
      .subscribe((eventType: CollectionEventType) => {
        this.setEventType(eventType);
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

        const eventType = (entity instanceof CollectionEventType)
          ? entity : new CollectionEventType().deserialize(entity);
        this.setEventType(eventType);
        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage, 'Update Successfull');
        }
      });
  }

  private setEventType(eventType: CollectionEventType): void {
    this.eventType = eventType;
      this.setSortedAnnotationTypes();
        this.setSoredSpecimenDefinitions();
    }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.eventType) {
      this.eventType = changes.eventType.currentValue;
      this.setSortedAnnotationTypes();
    }
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
    this.modalService.open(this.updateNameModal).result
      .then(value => {
        if (value.value) {
          this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
            eventType: this.eventType,
            attributeName: 'name',
            value: value.value
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
      .then(value => {
        this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeRequest({
          eventType: this.eventType,
          attributeName: 'description',
          value: value.value ? value.value : undefined
        }));
        this.updatedMessage = 'Event description was updated';
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

  viewAnnotationType($event: AnnotationType): void {
    const modalRef = this.modalService.open(AnnotationTypeViewComponent, { size: 'lg' });
    modalRef.componentInstance.annotationType = $event;

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

        this.updatedMessage = 'Annotation removed';
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

  private setSortedAnnotationTypes(): void {
    if (this.eventType) {
      this.sortedAnnotationTypes = AnnotationType.sortAnnotationTypes(this.eventType.annotationTypes);
    }
  }

  private setSoredSpecimenDefinitions(): void {
    if (this.eventType) {
      this.sortedSpecimenDefinitions =
        SpecimenDefinition.sortSpecimenDefinitions(this.eventType.specimenDefinitions);
    }
  }

}
