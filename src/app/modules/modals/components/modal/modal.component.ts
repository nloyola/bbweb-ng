import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  @Input() modalInputValid = true;
  @Input() cancelButtonShow = true;

  @Output() confirm = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter<any>();

  constructor() {}

  onConfirm(): void {
    this.confirm.emit(null);
  }

  onDismiss(): void {
    this.dismiss.emit(null);
  }
}
