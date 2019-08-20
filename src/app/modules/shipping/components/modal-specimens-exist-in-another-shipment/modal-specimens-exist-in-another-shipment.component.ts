import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-specimens-exist-in-another-shipment',
  templateUrl: './modal-specimens-exist-in-another-shipment.component.html',
  styleUrls: ['./modal-specimens-exist-in-another-shipment.component.scss']
})
export class ModalSpecimensExistInAnotherShipmentComponent implements OnInit {
  @Input() specimenIds: string[];
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  confirm(): void {
    this.modal.close();
  }
}
