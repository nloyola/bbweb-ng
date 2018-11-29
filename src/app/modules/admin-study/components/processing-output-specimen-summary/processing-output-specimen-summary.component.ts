import { Component, OnInit, Input } from '@angular/core';
import { OutputSpecimenProcessing } from '@app/domain/studies';

@Component({
  selector: 'app-processing-output-specimen-summary',
  templateUrl: './processing-output-specimen-summary.component.html',
  styleUrls: ['./processing-output-specimen-summary.component.scss']
})
export class ProcessingOutputSpecimenSummaryComponent {

  @Input() output: OutputSpecimenProcessing;

  constructor() { }

}
