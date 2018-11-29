import { Component, Input, OnInit } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';
import { ProcessingType } from '@app/domain/studies';

@Component({
  selector: 'app-processing-type-card',
  templateUrl: './processing-type-card.component.html',
  styleUrls: ['./processing-type-card.component.scss']
})
export class ProcessingTypeCardComponent implements OnInit {

  @Input() processingType: ProcessingType;
  @Input() inputEntityName: string;
  @Input() inputDefinitionName: string;

  sortedAnnotationTypes: AnnotationType[];

  constructor() { }

  ngOnInit() {
    this.sortedAnnotationTypes = this.processingType
      ? AnnotationType.sortAnnotationTypes(this.processingType.annotationTypes) : [];
  }

}
