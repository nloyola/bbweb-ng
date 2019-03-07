import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-modal-input',
  templateUrl: './modal-input.component.html',
  styleUrls: ['./modal-input.component.scss']
})
export class ModalInputComponent {

  @Input() modalClose: (result: any) => void;
  @Input() modalInputValid = true;

  constructor() { }

  close(source: any): void {
    this.modalClose(source);
  }

}
