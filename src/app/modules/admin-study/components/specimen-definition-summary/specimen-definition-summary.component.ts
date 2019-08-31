import { Component, OnInit, Input } from '@angular/core';
import { SpecimenDefinition } from '@app/domain/studies/specimen-definition.model';

@Component({
  selector: 'app-specimen-definition-summary',
  templateUrl: './specimen-definition-summary.component.html',
  styleUrls: ['./specimen-definition-summary.component.scss']
})
export class SpecimenDefinitionSummaryComponent implements OnInit {
  @Input() specimenDefinition: SpecimenDefinition;

  constructor() {}

  ngOnInit() {}
}
