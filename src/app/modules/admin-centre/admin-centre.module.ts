import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../material.module';
import { ModalInputModule } from '../modal-input/modal-input.module';
import { AdminCentreRoutingModule } from './admin-centre-routing.module';
import { CentreCountsComponent } from './components/centre-counts/centre-counts.component';
import { CentreLocationAddComponent } from './components/centre-location-add/centre-location-add.component';
import { CentreLocationsComponent } from './components/centre-locations/centre-locations.component';
import { CentreStudiesComponent } from './components/centre-studies/centre-studies.component';
import { CentreSummaryComponent } from './components/centre-summary/centre-summary.component';
import { CentreViewComponent } from './components/centre-view/centre-view.component';
import { CentresAdminComponent } from './components/centres-admin/centres-admin.component';
import { CentresViewComponent } from './components/centres-view/centres-view.component';
import { StudyRemoveComponent } from './components/study-remove/study-remove.component';
import { LocationRemoveComponent } from '@app/shared/components/location-remove/location-remove.component';
import { CentreAddComponent } from './components/centre-add/centre-add.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FontAwesomeModule,
    SharedModule,
    NgbModule,
    AdminCentreRoutingModule,
    ModalInputModule
  ],
  declarations: [
    CentresAdminComponent,
    CentresViewComponent,
    CentreCountsComponent,
    CentreViewComponent,
    CentreSummaryComponent,
    CentreStudiesComponent,
    StudyRemoveComponent,
    CentreLocationsComponent,
    CentreLocationAddComponent,
    CentreAddComponent
  ],
  exports: [
    CentresAdminComponent
  ],
  entryComponents: [
    StudyRemoveComponent,
    LocationRemoveComponent
  ]
})
export class AdminCentreModule { }
