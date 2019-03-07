import { Component, Input } from '@angular/core';
import { EntityInfo } from '@app/domain';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-remove-modal',
  templateUrl: './user-remove-modal.component.html',
  styleUrls: ['./user-remove-modal.component.scss']
})
export class UserRemoveModalComponent {

  @Input() user: EntityInfo;

  constructor(public activeModal: NgbActiveModal) { }

  close(): (result: any) => void {
    return (source: any): void => {
      const result = {
        confirmed: (source === 'OK'),
        value: this.user
      };
      this.activeModal.close(result);
    };
  }
}
