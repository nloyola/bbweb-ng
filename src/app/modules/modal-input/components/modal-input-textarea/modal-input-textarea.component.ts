import { Component, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ModalInputTextareaOptions } from '@app/modules/modal-input/models';

@Component({
  selector: 'app-modal-input-textarea',
  templateUrl: './modal-input-textarea.component.html',
  styleUrls: ['./modal-input-textarea.component.scss']
})
export class ModalInputTextareaComponent implements OnInit {

  @Input() title: string;
  @Input() label: string;
  @Input() value: string;
  @Input() options: ModalInputTextareaOptions;
  @Input() modalClose: (result: any) => void;
  @ViewChild('modalBody') modalBody: TemplateRef<any>;

  private form: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    const validators = [];
    if (this.options.required) {
      validators.push(Validators.required);
    }

    if (!this.options.rows) { this.options.rows = 3; }
    if (!this.options.cols) { this.options.cols = 10; }

    this.form = this.formBuilder.group({ textarea: [this.value, validators] });
  }

  get textarea(): AbstractControl {
    return this.form.get('textarea');
  }

  close(): (result: any) => void {
    return (source: any): void => {
      const trimmedValue = this.form.value.textarea.trim();
      this.modalClose({
        confirmed: (source === 'OK'),
        value: trimmedValue.length > 0 ? trimmedValue : undefined,
      });
    };
  }

}
