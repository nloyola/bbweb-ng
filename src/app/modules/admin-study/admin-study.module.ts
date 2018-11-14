import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/modules/material.module';
import { ModalInputModule } from '@app/modules/modal-input/modal-input.module';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { SharedModule } from '@app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminStudyRoutingModule } from './admin-study-routing.module';
import { AnnotationTypeSummaryComponent } from './components/annotation-type-summary/annotation-type-summary.component';
import { CollectedSpecimenDefinitionAddComponent } from './components/collected-specimen-definition-add/collected-specimen-definition-add.component';
import { CollectedSpecimenDefinitionAddContainer } from './components/collected-specimen-definition-add/collected-specimen-definition-add.container';
import { CollectionAnnotationTypeAddContainer } from './components/collection-annotation-type-add/collection-annotation-type-add.container';
import { EventTypeAddComponent } from './components/event-type-add/event-type-add.component';
import { EventTypeRemoveComponent } from './components/event-type-remove/event-type-remove.component';
import { EventTypeViewComponent } from './components/event-type-view/event-type-view.component';
import { EventTypeViewContainer } from './components/event-type-view/event-type-view.container';
import { EventTypesAddAndSelectComponent } from './components/event-types-add-and-select/event-types-add-and-select.component';
import { ParticipantAnnotationTypeAddContainer } from './components/participant-annotation-type-add/participant-annotation-type-add.container';
import { SpecimenDefinitionActionsComponent } from './components/specimen-definition-actions/specimen-definition-actions.component';
import { SpecimenDefinitionRemoveComponent } from './components/specimen-definition-remove/specimen-definition-remove.component';
import { SpecimenDefinitionSummaryComponent } from './components/specimen-definition-summary/specimen-definition-summary.component';
import { SpecimenDefinitionViewComponent } from './components/specimen-definition-view/specimen-definition-view.component';
import { StudiesAdminComponent } from './components/studies-admin/studies-admin.component';
import { StudiesViewComponent } from './components/studies-view/studies-view.component';
import { StudyAddComponent } from './components/study-add/study-add.component';
import { StudyCollectionComponent } from './components/study-collection/study-collection.component';
import { StudyCountsComponent } from './components/study-counts/study-counts.component';
import { StudyParticipantsComponent } from './components/study-participants/study-participants.component';
import { StudyProcessingComponent } from './components/study-processing/study-processing.component';
import { StudySummaryComponent } from './components/study-summary/study-summary.component';
import { StudyViewComponent } from './components/study-view/study-view.component';

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
    AnnotationTypeSummaryComponent,
    EventTypesAddAndSelectComponent,
    EventTypeViewContainer,
    EventTypeViewComponent,
    EventTypeAddComponent,
    EventTypeRemoveComponent,
    StudiesViewComponent,
    ParticipantAnnotationTypeAddContainer,
    CollectionAnnotationTypeAddContainer,
    SpecimenDefinitionSummaryComponent,
    SpecimenDefinitionActionsComponent,
    SpecimenDefinitionViewComponent,
    CollectedSpecimenDefinitionAddContainer,
    CollectedSpecimenDefinitionAddComponent,
    SpecimenDefinitionRemoveComponent
  ],
  exports: [
    StudiesAdminComponent
  ],
  entryComponents: [
    AnnotationTypeRemoveComponent,
    AnnotationTypeViewComponent,
    EventTypeAddComponent,
    EventTypeRemoveComponent,
    StudyAddComponent,
    SpecimenDefinitionViewComponent,
    SpecimenDefinitionRemoveComponent
  ]
})
export class AdminStudyModule { }