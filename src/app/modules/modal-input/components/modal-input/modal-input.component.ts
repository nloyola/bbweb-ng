import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal-input',
  templateUrl: './modal-input.component.html',
  styleUrls: ['./modal-input.component.scss']
})
export class ModalInputComponent {

  @Input() modalClose: (result: any) => void;

  constructor() { }

  close(source: any): void {
    this.modalClose(source);
  }

}
