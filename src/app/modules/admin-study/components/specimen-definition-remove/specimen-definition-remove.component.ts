import { Component, Input } from '@angular/core';
import { SpecimenDefinition } from '@app/domain/studies';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-specimen-definition-remove',
  templateUrl: './specimen-definition-remove.component.html',
  styleUrls: ['./specimen-definition-remove.component.scss']
})
export class SpecimenDefinitionRemoveComponent {
  @Input() specimenDefinition: SpecimenDefinition;

  constructor(public activeModal: NgbActiveModal) {}
}
