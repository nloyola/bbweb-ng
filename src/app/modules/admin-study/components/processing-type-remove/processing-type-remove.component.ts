import { Component, Input } from '@angular/core';
import { ProcessingType } from '@app/domain/studies';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-processing-type-remove',
  templateUrl: './processing-type-remove.component.html',
  styleUrls: ['./processing-type-remove.component.scss']
})
export class ProcessingTypeRemoveComponent {
  @Input() processingType: ProcessingType;

  constructor(public activeModal: NgbActiveModal) {}
}
