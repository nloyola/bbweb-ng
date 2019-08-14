import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalInputBooleanComponent } from './components/modal-input-boolean/modal-input-boolean.component';
import { ModalInputEmailComponent } from './components/modal-input-email/modal-input-email.component';
import { ModalInputPasswordComponent } from './components/modal-input-password/modal-input-password.component';
import { ModalInputTextComponent } from './components/modal-input-text/modal-input-text.component';
import { ModalInputTextareaComponent } from './components/modal-input-textarea/modal-input-textarea.component';
import { ModalInputUrlComponent } from './components/modal-input-url/modal-input-url.component';
import { ModalInputComponent } from './components/modal-input/modal-input.component';
import { StudyRemoveModalComponent } from './components/study-remove-modal/study-remove-modal.component';
import { UserRemoveModalComponent } from './components/user-remove-modal/user-remove-modal.component';
import { CentreRemoveModalComponent } from './components/centre-remove-modal/centre-remove-modal.component';
import { ModalYesNoComponent } from './components/modal-yes-no/modal-yes-no.component';
import { ModalInputNumberComponent } from './components/modal-input-number/modal-input-number.component';
import { ModalInputDateTimeComponent } from './components/modal-input-date/modal-input-date-time.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ShipmentNotInCreatedModalComponent } from './components/shipment-not-in-created-modal/shipment-not-in-created-modal.component';
import { ShipmentHasSpecimensComponent } from './components/shipment-has-specimens/shipment-has-specimens.component';
import { ShipmentRemoveModalComponent } from './components/shipment-remove-modal/shipment-remove-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgbModule,
    FontAwesomeModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  declarations: [
    ModalInputComponent,
    ModalInputTextComponent,
    ModalInputTextareaComponent,
    ModalInputNumberComponent,
    ModalInputDateTimeComponent,
    ModalInputBooleanComponent,
    ModalInputEmailComponent,
    ModalInputUrlComponent,
    ModalInputPasswordComponent,
    StudyRemoveModalComponent,
    UserRemoveModalComponent,
    CentreRemoveModalComponent,
    ModalYesNoComponent,
    ShipmentNotInCreatedModalComponent,
    ShipmentHasSpecimensComponent,
    ShipmentRemoveModalComponent
  ],
  exports: [
    ModalInputComponent,
    ModalInputBooleanComponent,
    ModalInputTextComponent,
    ModalInputTextareaComponent,
    ModalInputNumberComponent,
    ModalInputDateTimeComponent,
    ModalInputEmailComponent,
    ModalInputUrlComponent,
    ModalInputPasswordComponent,
    StudyRemoveModalComponent,
    UserRemoveModalComponent,
    CentreRemoveModalComponent,
    ModalYesNoComponent
  ]
})
export class ModalInputModule {}
