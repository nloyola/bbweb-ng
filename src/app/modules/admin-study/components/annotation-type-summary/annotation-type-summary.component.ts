import { Component, OnInit, Input } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';

@Component({
  selector: 'app-annotation-type-summary',
  templateUrl: './annotation-type-summary.component.html',
  styleUrls: ['./annotation-type-summary.component.scss']
})
export class AnnotationTypeSummaryComponent implements OnInit {

  @Input() annotationType: AnnotationType;
  requiredLabel: string;

  constructor() { }

  ngOnInit() {
     this.requiredLabel = this.annotationType.required ? 'Yes' : 'No';
  }

}
