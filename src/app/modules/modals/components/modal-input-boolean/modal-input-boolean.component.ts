import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { ModalInputTextComponent } from '../modal-input-text/modal-input-text.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-modal-input-boolean',
  templateUrl: './modal-input-boolean.component.html',
  styleUrls: ['./modal-input-boolean.component.scss']
})
export class ModalInputBooleanComponent extends ModalInputTextComponent implements OnInit, OnDestroy {

  ngOnInit() {
    super.ngOnInit();
    const validators = [];
    if (this.options.required) {
      validators.push(Validators.required);
    }

    this.modalInputForm = this.formBuilder.group({ input: [this.value, validators] });

    this.modalInputForm.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.modalInputValid = true;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get input(): AbstractControl {
    return this.modalInputForm.get('input');
  }

  confirm(): void {
    this.modal.close(this.modalInputForm.value.input);
  }

}
