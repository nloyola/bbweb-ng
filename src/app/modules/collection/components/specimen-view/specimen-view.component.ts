import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-specimen-view',
  templateUrl: './specimen-view.component.html',
  styleUrls: ['./specimen-view.component.scss']
})
export class SpecimenViewComponent implements OnInit {

  state: string;
  date: Date;

  constructor() { }

  ngOnInit() {
    this.state = 'Usable';
    this.date = new Date('2014-10-08 12:00');
  }

}
