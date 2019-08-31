import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudyStateInfo } from '@app/domain/studies';

@Component({
  selector: 'app-study-remove-modal',
  templateUrl: './study-remove-modal.component.html',
  styleUrls: ['./study-remove-modal.component.scss']
})
export class StudyRemoveModalComponent {
  @Input() study: StudyStateInfo;

  constructor(private activeModal: NgbActiveModal) {}

  confirm(): void {
    this.activeModal.close(this.study);
  }
}
