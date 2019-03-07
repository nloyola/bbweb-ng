import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-input',
  templateUrl: './modal-input.component.html',
  styleUrls: ['./modal-input.component.scss']
})
export class ModalInputComponent {

  @Input() modalInputValid = true;

  @Output() onConfirm = new EventEmitter<any>();
  @Output() onDismiss = new EventEmitter<any>();

  constructor() { }

  confirm(): void {
    this.onConfirm.emit(null);
  }

  dismiss(): void {
    this.onDismiss.emit(null);
  }

}
