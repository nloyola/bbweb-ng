import { Component, Input } from '@angular/core';
import { CentreCountsUIMap } from '@app/domain/centres';

@Component({
  selector: 'app-centre-counts',
  templateUrl: './centre-counts.component.html',
  styleUrls: ['./centre-counts.component.scss']
})
export class CentreCountsComponent {
  @Input() countData: CentreCountsUIMap;

  constructor() {}

  getCounts() {
    return Array.from(this.countData.values());
  }
}
