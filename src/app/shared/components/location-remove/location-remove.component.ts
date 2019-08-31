import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@app/domain';

@Component({
  selector: 'app-location-remove',
  templateUrl: './location-remove.component.html',
  styleUrls: ['./location-remove.component.scss']
})
export class LocationRemoveComponent {
  @Input() location: Location;

  constructor(public activeModal: NgbActiveModal) {}
}
