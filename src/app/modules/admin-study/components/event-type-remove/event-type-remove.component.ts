import { Component, Input } from '@angular/core';
import { CollectionEventType } from '@app/domain/studies';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-event-type-remove',
  templateUrl: './event-type-remove.component.html',
  styleUrls: ['./event-type-remove.component.scss']
})
export class EventTypeRemoveComponent {

  @Input() eventType: CollectionEventType;

  constructor(public activeModal: NgbActiveModal) {}

  confirm(activeModal: NgbActiveModal): void {
    activeModal.close(this.eventType);
  }

}
