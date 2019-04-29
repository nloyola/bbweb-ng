import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { ModalInputModule } from '../modals/modals.module';
import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionPageComponent } from './components/collection-page/collection-page.component';
import { ParticipantAddPageComponent } from './components/participant-add-page/participant-add-page.component';
import { ParticipantViewPageComponent } from './components/participant-view-page/participant-view-page.component';
import { ParticipantAddFormComponent } from './components/participant-add-form/participant-add-form.component';
import { AnnotationsAddSubformComponent } from './components/annotations-add-subform/annotations-add-subform.component';
import { BrowserModule } from '@angular/platform-browser';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CollectionRoutingModule,
    ModalInputModule,
    FontAwesomeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  declarations: [
    CollectionPageComponent,
    ParticipantAddPageComponent,
    ParticipantViewPageComponent,
    ParticipantAddFormComponent,
    AnnotationsAddSubformComponent
  ]
})
export class CollectionModule { }
