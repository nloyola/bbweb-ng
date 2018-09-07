import { Component, OnInit, Input } from '@angular/core';
import { StudyCountInfo } from '@app/domain/studies';

@Component({
  selector: 'app-study-counts',
  templateUrl: './study-counts.component.html',
  styleUrls: ['./study-counts.component.scss']
})
export class StudyCountsComponent implements OnInit {

  @Input() countData: StudyCountInfo[];

  constructor() { }

  ngOnInit() {
  }

}
