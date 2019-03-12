import { Component, Input } from '@angular/core';
import { ICentreInfoAndState } from '@app/domain/centres';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-centre-remove-modal',
  templateUrl: './centre-remove-modal.component.html',
  styleUrls: ['./centre-remove-modal.component.scss']
})
export class CentreRemoveModalComponent {

  @Input() centre: ICentreInfoAndState;

  constructor(private activeModal: NgbActiveModal) { }

  confirm(): void {
    this.activeModal.close(this.centre);
  }
}
