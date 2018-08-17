import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@app/material.module';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin/admin.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    AdminRoutingModule
  ],
  declarations: [AdminComponent]
})
export class AdminModule { }
