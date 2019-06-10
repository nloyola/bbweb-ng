import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalInputTextComponent } from '@app/modules/modals/components/modal-input-text/modal-input-text.component';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-modal-input-date-time',
  templateUrl: './modal-input-date-time.component.html',
  styleUrls: ['./modal-input-date-time.component.scss']
})
export class ModalInputDateTimeComponent extends ModalInputTextComponent implements OnInit {

  faCalendar = faCalendar;

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
    this.options = {};
  }

  ngOnInit() {
    super.ngOnInit();
  }
}
