import { Component, Input, OnInit } from '@angular/core';
import { CollectionEvent, Participant, Specimen } from '@app/domain/participants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-specimen-view-modal',
  templateUrl: './specimen-view-modal.component.html',
  styleUrls: ['./specimen-view-modal.component.scss']
})
export class SpecimenViewModalComponent {

  @Input() specimen: Specimen;
  @Input() event: CollectionEvent;
  @Input() participant: Participant;

  cancelButtonShow = false;

  constructor(private modal: NgbActiveModal) { }

  confirm(): void {
    this.modal.close();
  }

  dismiss(): void {
    this.modal.dismiss();
  }
}
