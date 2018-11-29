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
import { CollectedSpecimenDefinitionAddContainerComponent } from './components/collected-specimen-definition-add/collected-specimen-definition-add.container';
import { CollectionAnnotationTypeAddContainerComponent } from './components/collection-annotation-type-add/collection-annotation-type-add.container';
import { EventTypeAddComponent } from './components/event-type-add/event-type-add.component';
import { EventTypeRemoveComponent } from './components/event-type-remove/event-type-remove.component';
import { EventTypeViewComponent } from './components/event-type-view/event-type-view.component';
import { EventTypeViewContainerComponent } from './components/event-type-view/event-type-view.container';
import { EventTypesAddAndSelectComponent } from './components/event-types-add-and-select/event-types-add-and-select.component';
import { ParticipantAnnotationTypeAddContainer } from './components/participant-annotation-type-add/participant-annotation-type-add.container';
import { ProcessingAnnotationTypeAddContainerComponent } from './components/processing-annotation-type-add/processing-annotation-type-add.container';
import { ProcessingTypeAddComponent } from './components/processing-type-add/processing-type-add.component';
import { ProcessingTypeInformationSubformComponent } from './components/processing-type-information-subform/processing-type-information-subform.component';
import { ProcessingTypeInputSubformComponent } from './components/processing-type-input-subform/processing-type-input-subform.component';
import { ProcessingTypeOutputSubformComponent } from './components/processing-type-output-subform/processing-type-output-subform.component';
import { ProcessingTypeRemoveComponent } from './components/processing-type-remove/processing-type-remove.component';
import { ProcessingTypeViewComponent } from './components/processing-type-view/processing-type-view.component';
import { ProcessingTypeViewContainerComponent } from './components/processing-type-view/processing-type-view.container';
import { ProcessingTypesAddAndSelectComponent } from './components/processing-types-add-and-select/processing-types-add-and-select.component';
import { SpecimenDefinitionActionsComponent } from './components/specimen-definition-actions/specimen-definition-actions.component';
import { SpecimenDefinitionAddComponent } from './components/specimen-definition-add/specimen-definition-add.component';
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
import { ProcessingInputSpecimenSummaryComponent } from './components/processing-input-specimen-summary/processing-input-specimen-summary.component';
import { ProcessingOutputSpecimenSummaryComponent } from './components/processing-output-specimen-summary/processing-output-specimen-summary.component';
import { ProcessingInputSpecimenModalComponent } from './components/processing-input-specimen-modal/processing-input-specimen-modal.component';
import { ProcessingOutputSpecimenModalComponent } from './components/processing-output-specimen-modal/processing-output-specimen-modal.component';
import { ProcessingTypeCardComponent } from './components/processing-type-card/processing-type-card.component';

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
    EventTypeViewContainerComponent,
    EventTypeViewComponent,
    EventTypeAddComponent,
    EventTypeRemoveComponent,
    StudiesViewComponent,
    ParticipantAnnotationTypeAddContainer,
    CollectionAnnotationTypeAddContainerComponent,
    SpecimenDefinitionSummaryComponent,
    SpecimenDefinitionActionsComponent,
    SpecimenDefinitionViewComponent,
    CollectedSpecimenDefinitionAddContainerComponent,
    CollectedSpecimenDefinitionAddComponent,
    SpecimenDefinitionRemoveComponent,
    ProcessingTypesAddAndSelectComponent,
    ProcessingTypeViewComponent,
    ProcessingTypeViewContainerComponent,
    ProcessingTypeAddComponent,
    SpecimenDefinitionAddComponent,
    ProcessingTypeInformationSubformComponent,
    ProcessingTypeInputSubformComponent,
    ProcessingTypeOutputSubformComponent,
    ProcessingTypeRemoveComponent,
    ProcessingAnnotationTypeAddContainerComponent,
    ProcessingInputSpecimenSummaryComponent,
    ProcessingOutputSpecimenSummaryComponent,
    ProcessingInputSpecimenModalComponent,
    ProcessingOutputSpecimenModalComponent,
    ProcessingTypeCardComponent
  ],
  exports: [
    StudiesAdminComponent
  ],
  entryComponents: [
    AnnotationTypeRemoveComponent,
    AnnotationTypeViewComponent,
    EventTypeAddComponent,
    EventTypeRemoveComponent,
    ProcessingTypeRemoveComponent,
    StudyAddComponent,
    SpecimenDefinitionViewComponent,
    SpecimenDefinitionRemoveComponent,
    ProcessingInputSpecimenModalComponent,
    ProcessingOutputSpecimenModalComponent
  ]
})
export class AdminStudyModule { }
