import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './components/admin/admin.component';
import { StudiesAdminComponent } from './components/studies-admin/studies-admin.component';
import { StudyAddComponent } from './components/study-add/study-add.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    AdminRoutingModule
  ],
  declarations: [AdminComponent, StudiesAdminComponent, StudyAddComponent]
})
export class AdminModule { }
