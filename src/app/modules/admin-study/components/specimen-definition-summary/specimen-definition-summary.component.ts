import { Component, Input, OnInit } from '@angular/core';
import { CollectedSpecimenDefinition } from '@app/domain/studies';

@Component({
  selector: 'app-specimen-definition-summary',
  templateUrl: './specimen-definition-summary.component.html',
  styleUrls: ['./specimen-definition-summary.component.scss']
})
export class SpecimenDefinitionSummaryComponent implements OnInit {
  @Input() specimenDefinition: CollectedSpecimenDefinition;

  constructor() {}

  ngOnInit() {}
}
