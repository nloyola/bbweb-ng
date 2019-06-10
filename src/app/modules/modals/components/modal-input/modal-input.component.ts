import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-input',
  templateUrl: './modal-input.component.html',
  styleUrls: ['./modal-input.component.scss']
})
export class ModalInputComponent {

  @Input() modalInputValid = true;
  @Input() cancelButtonShow = true;

  @Output() confirm = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter<any>();

  constructor() { }

  onConfirm(): void {
    this.confirm.emit(null);
  }

  onDismiss(): void {
    this.dismiss.emit(null);
  }

}
