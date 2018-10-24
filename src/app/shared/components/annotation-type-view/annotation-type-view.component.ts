import { Component, Input, OnInit } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-annotation-type-view',
  templateUrl: './annotation-type-view.component.html',
  styleUrls: ['./annotation-type-view.component.scss']
})
export class AnnotationTypeViewComponent {

  @Input() annotationType: AnnotationType;

  constructor(public activeModal: NgbActiveModal) { }

}
