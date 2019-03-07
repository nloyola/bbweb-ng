import { Component, Input, OnInit } from '@angular/core';
import { ModalInputOptions, ModalInputResult } from '../../models';
import { Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-modal-input-boolean',
  templateUrl: './modal-input-boolean.component.html',
  styleUrls: ['./modal-input-boolean.component.scss']
})
export class ModalInputBooleanComponent implements OnInit {

  @Input() title: string;
  @Input() label: string;
  @Input() value: string;
  @Input() options: ModalInputOptions;
  @Input() modalClose: (result: ModalInputResult) => void;

  private form: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    const validators = [];
    if (this.options.required) {
      validators.push(Validators.required);
    }

    this.form = this.formBuilder.group({ input: [this.value, validators] });
  }

  get input(): AbstractControl {
    return this.form.get('input');
  }

  close(): (result: any) => void {
    return (source: any): void => {
      this.modalClose({
        confirmed: (source === 'OK'),
        value: this.form.value.input,
      });
    };
  }

}
