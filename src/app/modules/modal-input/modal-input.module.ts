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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgbModule,
    FontAwesomeModule,
    SharedModule,
  ],
  declarations: [
    ModalInputComponent,
    ModalInputTextComponent,
    ModalInputTextareaComponent,
    ModalInputBooleanComponent,
    ModalInputEmailComponent,
    ModalInputUrlComponent,
    ModalInputPasswordComponent,
    StudyRemoveModalComponent,
    UserRemoveModalComponent
  ],
  exports: [
    ModalInputComponent,
    ModalInputBooleanComponent,
    ModalInputTextComponent,
    ModalInputTextareaComponent,
    ModalInputEmailComponent,
    ModalInputUrlComponent,
    ModalInputPasswordComponent,
    StudyRemoveModalComponent,
    UserRemoveModalComponent
  ]
})
export class ModalInputModule { }
