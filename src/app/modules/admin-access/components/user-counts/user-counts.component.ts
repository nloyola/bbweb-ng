import { Component, Input } from '@angular/core';
import { UserCountsUIMap } from '@app/domain/users';

@Component({
  selector: 'app-user-counts',
  templateUrl: './user-counts.component.html',
  styleUrls: ['./user-counts.component.scss']
})
export class UserCountsComponent {
  @Input() countData: UserCountsUIMap;

  constructor() {}

  getCounts() {
    return Array.from(this.countData.values());
  }
}
