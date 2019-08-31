import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './components/admin/admin.component';
import { AdminStudyModule } from '@app/modules/admin-study/admin-study.module';
import { AdminCentreModule } from '../admin-centre/admin-centre.module';
import { AdminAccessModule } from '../admin-access/admin-access.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgbModule,
    FontAwesomeModule,
    SharedModule,
    AdminRoutingModule,
    AdminStudyModule,
    AdminCentreModule,
    AdminAccessModule
  ],
  declarations: [AdminComponent]
})
export class AdminModule {}
