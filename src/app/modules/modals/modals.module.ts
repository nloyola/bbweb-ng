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
import { ModalShipmentHasSpecimensComponent } from './components/modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ShipmentRemoveModalComponent } from './components/shipment-remove-modal/shipment-remove-modal.component';
import { ModalInputDoubleDateComponent } from './components/modal-input-double-date/modal-input-double-date.component';
import { ModalShipmentBackToCreatedComponent } from './components/modal-shipment-back-to-created/modal-shipment-back-to-created.component';
import { ModalShipmentBackToPackedComponent } from './components/modal-shipment-back-to-packed/modal-shipment-back-to-packed.component';
import { ModalShipmentTagAsLostComponent } from './components/modal-shipment-tag-as-lost/modal-shipment-tag-as-lost.component';
import { ModalShipmentHasNoSpecimensComponent } from './components/modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalSpecimensExistInAnotherShipmentComponent } from './components/modal-specimens-exist-in-another-shipment/modal-specimens-exist-in-another-shipment.component';

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
    ModalShipmentHasSpecimensComponent,
    ShipmentRemoveModalComponent,
    ModalInputDoubleDateComponent,
    ModalShipmentBackToCreatedComponent,
    ModalShipmentBackToPackedComponent,
    ModalShipmentTagAsLostComponent,
    ModalShipmentHasNoSpecimensComponent,
    ModalSpecimensExistInAnotherShipmentComponent
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
    ModalYesNoComponent,
    ModalInputDoubleDateComponent,
    ModalShipmentBackToCreatedComponent,
    ModalShipmentBackToPackedComponent,
    ModalShipmentTagAsLostComponent,
    ModalSpecimensExistInAnotherShipmentComponent
  ]
})
export class ModalInputModule {}
