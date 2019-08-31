import { Component, Input } from '@angular/core';
import { StudyCountsUIMap } from '@app/domain/studies';

@Component({
  selector: 'app-study-counts',
  templateUrl: './study-counts.component.html',
  styleUrls: ['./study-counts.component.scss']
})
export class StudyCountsComponent {
  @Input() countData: StudyCountsUIMap;

  constructor() {}

  getCounts() {
    return Array.from(this.countData.values());
  }
}
