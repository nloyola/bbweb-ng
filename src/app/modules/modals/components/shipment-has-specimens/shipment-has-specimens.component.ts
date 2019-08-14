import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-shipment-has-specimens',
  templateUrl: './shipment-has-specimens.component.html',
  styleUrls: ['./shipment-has-specimens.component.scss']
})
export class ShipmentHasSpecimensComponent implements OnInit {
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  confirm(): void {
    this.modal.close();
  }
}
