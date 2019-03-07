import { Component, Input } from '@angular/core';
import { EntityNameAndState } from '@app/domain';
import { StudyState } from '@app/domain/studies';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-study-remove-modal',
  templateUrl: './study-remove-modal.component.html',
  styleUrls: ['./study-remove-modal.component.scss']
})
export class StudyRemoveModalComponent {

  @Input() study: EntityNameAndState<StudyState>;

  constructor(private activeModal: NgbActiveModal) { }

  confirm(): void {
    this.activeModal.close(this.study);
  }
}
