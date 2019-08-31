import { Component, OnInit } from '@angular/core';
import { ModalInputTextComponent } from '@app/modules/modals/components/modal-input-text/modal-input-text.component';
import { CustomValidators } from '@app/shared/validators';

@Component({
  selector: 'app-modal-input-url',
  templateUrl: './modal-input-url.component.html',
  styleUrls: ['./modal-input-url.component.scss']
})
export class ModalInputUrlComponent extends ModalInputTextComponent implements OnInit {
  ngOnInit() {
    this.validators = [CustomValidators.url()];
    this.options = {
      ...this.options,
      minLength: undefined
    };
    super.ngOnInit();
  }
}
