import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-entity-status',
  templateUrl: './entity-status.component.html',
  styleUrls: ['./entity-status.component.scss']
})
export class EntityStatusComponent implements OnInit {

  @Input() state: string;
  @Input() timeAdded: Date;
  @Input() timeModified: Date;
  @Input() useBadges: boolean;
  @Input() bsClass: string;

  constructor() { }

  ngOnInit() {
    if ((this.useBadges === undefined) || this.useBadges) {
      this.useBadges = true;

      if (this.bsClass === undefined) {
        this.bsClass = 'badge-secondary';
      }
    } else if (this.bsClass === undefined) {
      this.bsClass = 'text-info';
    }

    // if time addded is less than year 1900 then timestamp will display as 'on system
    // initialization'
    this.timeAdded = (this.timeAdded && (this.timeAdded.getFullYear() < 1900))
      ? undefined : this.timeAdded;
  }

}
