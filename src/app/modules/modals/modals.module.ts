import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { CentreRemoveModalComponent } from './components/centre-remove-modal/centre-remove-modal.component';
import { ModalInputBooleanComponent } from './components/modal-input-boolean/modal-input-boolean.component';
import { ModalInputDateTimeComponent } from './components/modal-input-date/modal-input-date-time.component';
import { ModalInputDoubleDateComponent } from './components/modal-input-double-date/modal-input-double-date.component';
import { ModalInputEmailComponent } from './components/modal-input-email/modal-input-email.component';
import { ModalInputNumberComponent } from './components/modal-input-number/modal-input-number.component';
import { ModalInputPasswordComponent } from './components/modal-input-password/modal-input-password.component';
import { ModalInputTextComponent } from './components/modal-input-text/modal-input-text.component';
import { ModalInputTextareaComponent } from './components/modal-input-textarea/modal-input-textarea.component';
import { ModalInputUrlComponent } from './components/modal-input-url/modal-input-url.component';
import { ModalYesNoComponent } from './components/modal-yes-no/modal-yes-no.component';
import { ModalComponent } from './components/modal/modal.component';
import { StudyRemoveModalComponent } from './components/study-remove-modal/study-remove-modal.component';
import { UserRemoveModalComponent } from './components/user-remove-modal/user-remove-modal.component';
import { SpecimenViewModalComponent } from './components/specimen-view-modal/specimen-view-modal.component';

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
    ModalComponent,
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
    ModalInputDoubleDateComponent,
    SpecimenViewModalComponent
  ],
  exports: [
    ModalComponent,
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
    SpecimenViewModalComponent
  ]
})
export class ModalInputModule {}
