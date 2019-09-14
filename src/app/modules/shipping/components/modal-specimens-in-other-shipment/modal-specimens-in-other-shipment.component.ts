import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-specimens-in-other-shipment',
  templateUrl: './modal-specimens-in-other-shipment.component.html',
  styleUrls: ['./modal-specimens-in-other-shipment.component.scss']
})
export class ModalSpecimensInOtherShipmentComponent implements OnInit {
  @Input() specimenIds: string[];

  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  confirm(): void {
    this.modal.close();
  }
}
