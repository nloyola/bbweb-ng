import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, SpecimenDefinition } from '@app/domain/studies';
import { CollectedSpecimenDefinition } from '@app/domain/studies/collected-specimen-definition.model';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

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
  menuItems: DropdownMenuItem[];
  specimensMenuItems: DropdownMenuItem[];

  constructor() {
    this.menuItems = this.createMenuItems();
    this.specimensMenuItems = this.createSpecimensMenuItems();
  }

  ngOnInit() {
    if (this.eventType) {
      this.setEventType(this.eventType);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.eventType) {
      this.setEventType(changes.eventType.currentValue);
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

  viewSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    this.viewSpecimenDefinitionSelected.emit(specimenDefinition);
  }

  editSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    this.editSpecimenDefinitionSelected.emit(specimenDefinition);
  }

  removeSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    this.removeSpecimenDefinitionSelected.emit(specimenDefinition);
  }

  private setEventType(eventType: CollectionEventType): void {
    this.eventType = eventType;
    this.setSortedAnnotationTypes();
    this.setSoredSpecimenDefinitions();
  }

  private setSortedAnnotationTypes(): void {
    this.sortedAnnotationTypes = this.eventType
      ? AnnotationType.sortAnnotationTypes(this.eventType.annotationTypes)
      : [];
  }

  private setSoredSpecimenDefinitions(): void {
    this.sortedSpecimenDefinitions = this.eventType
      ? SpecimenDefinition.sortSpecimenDefinitions(this.eventType.specimenDefinitions)
      : [];
  }

  private createMenuItems(): DropdownMenuItem[] {
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
        label: 'Update Recurring',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateRecurringSelected.emit(null);
        }
      },
      {
        kind: 'selectable',
        label: 'Add Annotation',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.addAnnotationTypeSelected.emit(null);
        }
      },
      {
        kind: 'selectable',
        label: 'Remove this Event',
        icon: 'warning',
        iconClass: 'danger-icon',
        onSelected: () => {
          this.removeEventTypeSelected.emit(null);
        }
      }
    ];
    return items;
  }

  private createSpecimensMenuItems(): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Add a Specimen',
        icon: 'add_circle',
        iconClass: 'success-icon',
        onSelected: () => {
          this.addSpecimenDefinitionSelected.emit(null);
        }
      }
    ];
    return items;
  }
}
