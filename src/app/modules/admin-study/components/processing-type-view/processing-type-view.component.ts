import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';
import { ProcessingType, ProcessingTypeInputEntity, SpecimenDefinition } from '@app/domain/studies';

@Component({
  selector: 'app-processing-type-view-ui',
  templateUrl: './processing-type-view.component.html',
  styleUrls: ['./processing-type-view.component.scss']
})
export class ProcessingTypeViewComponent implements OnInit, OnChanges {

  @Input() processingType: ProcessingType;
  @Input() inputEntity: ProcessingTypeInputEntity;
  @Input() allowChanges: boolean;

  @Output() updateNameSelected               = new EventEmitter<any>();
  @Output() updateDescriptionSelected        = new EventEmitter<any>();
  @Output() updateEnabledSelected            = new EventEmitter<any>();
  @Output() addAnnotationTypeSelected        = new EventEmitter<any>();
  @Output() viewAnnotationTypeSelected       = new EventEmitter<AnnotationType>();
  @Output() editAnnotationTypeSelected       = new EventEmitter<AnnotationType>();
  @Output() removeAnnotationTypeSelected     = new EventEmitter<AnnotationType>();
  @Output() updateInputSpecimenSelected      = new EventEmitter<any>();
  @Output() updateOutputSpecimenSelected     = new EventEmitter<any>();
  @Output() removeProcessingTypeSelected     = new EventEmitter<any>();

  isPanelCollapsed = false;
  sortedAnnotationTypes: AnnotationType[];
  sortedSpecimenDefinitions: SpecimenDefinition[];

  constructor() {}

  ngOnInit() {
    this.setProcessingType(this.processingType);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.processingType) {
      this.setProcessingType(changes.processingType.currentValue);
    }
  }

  updateName() {
    this.updateNameSelected.emit(null);
  }

  updateDescription() {
    this.updateDescriptionSelected.emit(null);
  }

  updateEnabled() {
    this.updateEnabledSelected.emit(null);
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

  updateInputSpecimen() {
    this.updateInputSpecimenSelected.emit(null);
  }

  updateOutputSpecimen() {
    this.updateOutputSpecimenSelected.emit(null);
  }

  removeProcessingType() {
    this.removeProcessingTypeSelected.emit(null);
  }

  private setProcessingType(processingType: ProcessingType): void {
    this.processingType = processingType;
    this.setSortedAnnotationTypes();
  }

  private setSortedAnnotationTypes(): void {
    this.sortedAnnotationTypes = this.processingType
      ? AnnotationType.sortAnnotationTypes(this.processingType.annotationTypes) : [];
  }

}
