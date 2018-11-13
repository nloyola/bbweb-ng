import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, SpecimenDefinition } from '@app/domain/studies';
import { CollectedSpecimenDefinition } from '@app/domain/studies/collected-specimen-definition.model';
import { EventTypeStoreActions } from '@app/root-store';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { Subject } from 'rxjs';
import { EventTypeRemoveComponent } from '../event-type-remove/event-type-remove.component';
import { SpecimenDefinitionRemoveComponent } from '../specimen-definition-remove/specimen-definition-remove.component';
import { SpecimenDefinitionViewComponent } from '../specimen-definition-view/specimen-definition-view.component';

@Component({
  selector: 'app-event-type-view-ui',
  templateUrl: './event-type-view.component.html',
  styleUrls: ['./event-type-view.component.scss']
})
export class EventTypeViewComponent implements OnInit, OnChanges {

  @Input() eventType: CollectionEventType;
  @Input() allowChanges: boolean;

  @Output() updateNameSelected = new EventEmitter<any>();
  @Output() updateDescriptionSelected = new EventEmitter<any>();
  @Output() updateRecurringSelected = new EventEmitter<any>();
  @Output() addAnnotationTypeSelected = new EventEmitter<any>();
  @Output() viewAnnotationTypeSelected = new EventEmitter<AnnotationType>();
  @Output() editAnnotationTypeSelected = new EventEmitter<AnnotationType>();
  @Output() removeAnnotationTypeSelected = new EventEmitter<AnnotationType>();
  @Output() addSpecimenDefinitionSelected = new EventEmitter<CollectedSpecimenDefinition>();
  @Output() viewSpecimenDefinitionSelected = new EventEmitter<CollectedSpecimenDefinition>();
  @Output() editSpecimenDefinitionSelected = new EventEmitter<CollectedSpecimenDefinition>();
  @Output() removeSpecimenDefinitionSelected = new EventEmitter<any>();
  @Output() removeEventTypeSelected = new EventEmitter<any>();

  isPanelCollapsed = false;
  sortedAnnotationTypes: AnnotationType[];
  sortedSpecimenDefinitions: SpecimenDefinition[];

  constructor() {}

  ngOnInit() {
    this.setSortedAnnotationTypes();
    this.setSoredSpecimenDefinitions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.eventType) {
      this.setEventType(changes.eventType.currentValue);
    }
  }

  updateName() {
    this.updateNameSelected.emit(null);
  }

  updateDescription() {
    this.updateDescriptionSelected.emit(null);
  }

  updateRecurring() {
    this.updateRecurringSelected.emit(null);
  }

  addAnnotationType() {
    this.addAnnotationTypeSelected.emit(null);
  }

  viewAnnotationType(annotationType: AnnotationType): void {
    this.viewAnnotationTypeSelected.emit(annotationType);
  }

  editAnnotationType(annotationType: AnnotationType): void {
    this.editAnnotationTypeSelected.emit(annotationType);
  }

  removeAnnotationType(annotationType: AnnotationType): void {
    this.removeAnnotationTypeSelected.emit(annotationType);
  }

  addSpecimenDefinition() {
    this.addSpecimenDefinitionSelected.emit(null);
  }

  editSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    this.editSpecimenDefinitionSelected.emit(specimenDefinition);
  }

  removeSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    this.removeSpecimenDefinitionSelected.emit(specimenDefinition);
  }

  removeEventType() {
    this.removeEventTypeSelected.emit(null);
  }

  private setEventType(eventType: CollectionEventType): void {
    this.eventType = eventType;
    this.setSortedAnnotationTypes();
    this.setSoredSpecimenDefinitions();
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
