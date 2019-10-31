import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';
import { ProcessingType, ProcessingTypeInputEntity, SpecimenDefinition } from '@app/domain/studies';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-processing-type-view-ui',
  templateUrl: './processing-type-view.component.html',
  styleUrls: ['./processing-type-view.component.scss']
})
export class ProcessingTypeViewComponent implements OnInit, OnChanges {
  @Input() processingType: ProcessingType;
  @Input() inputEntity: ProcessingTypeInputEntity;
  @Input() allowChanges: boolean;

  @Output() updateNameSelected = new EventEmitter<any>();
  @Output() updateDescriptionSelected = new EventEmitter<any>();
  @Output() updateEnabledSelected = new EventEmitter<any>();
  @Output() addAnnotationTypeSelected = new EventEmitter<any>();
  @Output() viewAnnotationTypeSelected = new EventEmitter<AnnotationType>();
  @Output() editAnnotationTypeSelected = new EventEmitter<AnnotationType>();
  @Output() removeAnnotationTypeSelected = new EventEmitter<AnnotationType>();
  @Output() inputSpecimenUpdateSelected = new EventEmitter<any>();
  @Output() outputSpecimenUpdateSelected = new EventEmitter<any>();
  @Output() removeProcessingTypeSelected = new EventEmitter<any>();

  isPanelCollapsed = false;
  sortedAnnotationTypes: AnnotationType[];
  sortedSpecimenDefinitions: SpecimenDefinition[];
  stepMenuItems: DropdownMenuItem[];
  inputMenuItems: DropdownMenuItem[];
  outputMenuItems: DropdownMenuItem[];

  constructor() {
    this.stepMenuItems = this.createStepMenuItems();
    this.inputMenuItems = this.createInputMenuItems();
    this.outputMenuItems = this.createOutputMenuItems();
  }

  ngOnInit() {
    this.setProcessingType(this.processingType);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.processingType) {
      this.setProcessingType(changes.processingType.currentValue);
    }
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

  removeProcessingType() {
    this.removeProcessingTypeSelected.emit(null);
  }

  private setProcessingType(processingType: ProcessingType): void {
    this.processingType = processingType;
    this.setSortedAnnotationTypes();
  }

  private setSortedAnnotationTypes(): void {
    this.sortedAnnotationTypes = this.processingType
      ? AnnotationType.sortAnnotationTypes(this.processingType.annotationTypes)
      : [];
  }

  private createStepMenuItems(): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Update Name',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateNameSelected.emit(null);
        }
      },
      {
        kind: 'selectable',
        label: 'Update Description',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateDescriptionSelected.emit(null);
        }
      },
      {
        kind: 'selectable',
        label: 'Update Enabled',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateEnabledSelected.emit(null);
        }
      },
      {
        kind: 'selectable',
        label: 'Add Annotation',
        icon: 'add_circle',
        iconClass: 'success-icon',
        onSelected: () => {
          this.addAnnotationTypeSelected.emit(null);
        }
      },
      {
        kind: 'selectable',
        label: 'Remove this Step',
        icon: 'warning',
        iconClass: 'danger-icon',
        onSelected: () => {
          this.removeProcessingTypeSelected.emit(null);
        }
      }
    ];
    return items;
  }

  private createInputMenuItems(): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Make changes to the Input Specimen',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.inputSpecimenUpdateSelected.emit(null);
        }
      }
    ];
    return items;
  }

  private createOutputMenuItems(): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Make changes to the Output Specimen',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.outputSpecimenUpdateSelected.emit(null);
        }
      }
    ];
    return items;
  }
}
