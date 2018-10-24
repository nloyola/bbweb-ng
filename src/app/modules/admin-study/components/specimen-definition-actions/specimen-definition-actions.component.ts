import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SpecimenDefinition } from '@app/domain/studies';

@Component({
  selector: 'app-specimen-definition-actions',
  templateUrl: './specimen-definition-actions.component.html',
  styleUrls: ['./specimen-definition-actions.component.scss']
})
export class SpecimenDefinitionActionsComponent {

  @Input() specimenDefinition: SpecimenDefinition;
  @Input() modifyAllowed: boolean;

  @Output() viewSelected = new EventEmitter<SpecimenDefinition>();
  @Output() editSelected = new EventEmitter<SpecimenDefinition>();
  @Output() removeSelected = new EventEmitter<SpecimenDefinition>();

  constructor() { }

  view() {
    this.viewSelected.emit(this.specimenDefinition);
  }

  edit() {
    this.editSelected.emit(this.specimenDefinition);
  }

  remove() {
    this.removeSelected.emit(this.specimenDefinition);
  }

}
