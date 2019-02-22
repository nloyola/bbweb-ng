import { Component, Input } from '@angular/core';
import { EntityInfo } from '@app/domain';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-role-user-remove',
  templateUrl: './role-user-remove.component.html',
  styleUrls: ['./role-user-remove.component.scss']
})
export class RoleUserRemoveComponent {

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
