import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { ModalInputComponent } from '../modal-input.component';

@Component({
  selector: 'app-modal-input-date-time',
  templateUrl: './modal-input-date-time.component.html',
  styleUrls: ['./modal-input-date-time.component.scss']
})
export class ModalInputDateTimeComponent extends ModalInputComponent<Date> implements OnInit {
  faCalendar = faCalendar;

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  ngOnInit() {
    if (this.options.required) {
      this.validators.push(Validators.required);
    }
    super.ngOnInit();
  }
}
