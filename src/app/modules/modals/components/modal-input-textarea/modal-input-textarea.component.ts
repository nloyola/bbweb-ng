import { Component, Input, OnInit } from '@angular/core';
import { ModalInputTextComponent } from '@app/modules/modals/components/modal-input-text/modal-input-text.component';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '../../models';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-modal-input-textarea',
  templateUrl: './modal-input-textarea.component.html',
  styleUrls: ['./modal-input-textarea.component.scss']
})
export class ModalInputTextareaComponent extends ModalInputTextComponent {

  @Input() options: ModalInputTextareaOptions;

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  ngOnInit() {
    this.options = {
      ...this.options,
      rows: this.options.rows ? this.options.rows : 3,
      cols: this.options.cols ? this.options.cols : 10
    };
    debugger;
    super.ngOnInit();
  }

}
