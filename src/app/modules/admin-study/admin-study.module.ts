import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/modules/material.module';
import { ModalInputModule } from '@app/modules/modal-input/modal-input.module';
import { SharedModule } from '@app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminStudyRoutingModule } from './admin-study-routing.module';
import { AnnotationTypeSummaryComponent } from './components/annotation-type-summary/annotation-type-summary.component';
import { StudiesAdminComponent } from './components/studies-admin/studies-admin.component';
import { StudyAddComponent } from './components/study-add/study-add.component';
import { StudyCollectionComponent } from './components/study-collection/study-collection.component';
import { StudyCountsComponent } from './components/study-counts/study-counts.component';
import { StudyParticipantsComponent } from './components/study-participants/study-participants.component';
import { StudyProcessingComponent } from './components/study-processing/study-processing.component';
import { StudySummaryComponent } from './components/study-summary/study-summary.component';
import { StudyViewComponent } from './components/study-view/study-view.component';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FontAwesomeModule,
    SharedModule,
    NgbModule,
    AdminStudyRoutingModule,
    ModalInputModule
  ],
  declarations: [
    StudiesAdminComponent,
    StudyAddComponent,
    StudyCountsComponent,
    StudyViewComponent,
    StudySummaryComponent,
    StudyParticipantsComponent,
    StudyCollectionComponent,
    StudyProcessingComponent,
    AnnotationTypeSummaryComponent
  ],
  exports: [
    StudiesAdminComponent
  ],
  entryComponents: [
    AnnotationTypeRemoveComponent
  ]
})
export class AdminStudyModule { }
