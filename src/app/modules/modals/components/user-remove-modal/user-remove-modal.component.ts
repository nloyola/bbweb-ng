import { Component, Input } from '@angular/core';
import { IUserInfo } from '@app/domain/users';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-remove-modal',
  templateUrl: './user-remove-modal.component.html',
  styleUrls: ['./user-remove-modal.component.scss']
})
export class UserRemoveModalComponent {
  @Input() user: IUserInfo;

  constructor(public modal: NgbActiveModal) {}

  confirm(): void {
    this.modal.close(this.user);
  }
}
