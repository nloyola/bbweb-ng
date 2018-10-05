import { Component, Input } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-annotation-type-remove',
  templateUrl: './annotation-type-remove.component.html',
  styleUrls: ['./annotation-type-remove.component.scss']
})
export class AnnotationTypeRemoveComponent {

  @Input() annotationType: AnnotationType;

  constructor(public activeModal: NgbActiveModal) {}
}
