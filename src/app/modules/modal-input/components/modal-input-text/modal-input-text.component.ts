import { Component, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ModalInputTextOptions } from '@app/modules/modal-input/models';

@Component({
  selector: 'app-modal-input-text',
  templateUrl: './modal-input-text.component.html',
  styleUrls: ['./modal-input-text.component.scss']
})
export class ModalInputTextComponent implements OnInit {

  @Input() title: string;
  @Input() label: string;
  @Input() value: string;
  @Input() options: ModalInputTextOptions;
  @Input() modalClose: (result: any) => void;
  @ViewChild('modalBody') modalBody: TemplateRef<any>;

  private textForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    const validators = [];
    if (this.options.required) {
      validators.push(Validators.required);
    }

    if (this.options.minLength) {
      validators.push(Validators.min(this.options.minLength));
    }

    this.textForm = this.formBuilder.group({ text: [this.value, validators] });
  }

  get text(): AbstractControl {
    return this.textForm.get('text');
  }

  close(): (result: any) => void {
    return (source: any) => {
      const value = this.textForm.value.text;
      this.modalClose((source === 'OK') ? { value } : source)
    };
  }

}
