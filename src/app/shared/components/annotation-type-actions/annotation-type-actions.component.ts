import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';

@Component({
  selector: 'app-annotation-type-actions',
  templateUrl: './annotation-type-actions.component.html'
})
export class AnnotationTypeActionsComponent {
  @Input() annotationType: AnnotationType;
  @Input() modifyAllowed: boolean;

  @Output() viewSelected = new EventEmitter<AnnotationType>();
  @Output() editSelected = new EventEmitter<AnnotationType>();
  @Output() removeSelected = new EventEmitter<AnnotationType>();

  constructor() {}

  view() {
    this.viewSelected.emit(this.annotationType);
  }

  edit() {
    this.editSelected.emit(this.annotationType);
  }

  remove() {
    this.removeSelected.emit(this.annotationType);
  }
}
