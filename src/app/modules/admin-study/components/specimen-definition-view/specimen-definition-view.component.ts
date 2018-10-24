import { Component, Input } from '@angular/core';
import { SpecimenDefinition } from '@app/domain/studies';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-specimen-definition-view',
  templateUrl: './specimen-definition-view.component.html',
  styleUrls: ['./specimen-definition-view.component.scss']
})
export class SpecimenDefinitionViewComponent {

  @Input() specimenDefinition: SpecimenDefinition;

  constructor(public activeModal: NgbActiveModal) { }

}
