import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './components/admin/admin.component';
import { StudiesAdminComponent } from './components/studies-admin/studies-admin.component';
import { StudyAddComponent } from './components/study-add/study-add.component';
import { StudyCountsComponent } from './components/study-counts/study-counts.component';
import { StudyViewComponent } from './components/study-view/study-view.component';
import { StudySummaryComponent } from './components/study-summary/study-summary.component';
import { StudyParticipantsComponent } from './components/study-participants/study-participants.component';
import { StudyCollectionComponent } from './components/study-collection/study-collection.component';
import { StudyProcessingComponent } from './components/study-processing/study-processing.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    AdminRoutingModule,
    NgbModule,
    FontAwesomeModule
  ],
  declarations: [
    AdminComponent,
    StudiesAdminComponent,
    StudyAddComponent,
    StudyCountsComponent,
    StudyViewComponent,
    StudySummaryComponent,
    StudyParticipantsComponent,
    StudyCollectionComponent,
    StudyProcessingComponent
  ]
})
export class AdminModule { }
