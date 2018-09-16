import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionComponent } from './components/collection/collection.component';
import { SpecimenViewComponent } from './components/specimen-view/specimen-view.component';
import { SpecimenLocationViewComponent } from './components/specimen-location-view/specimen-location-view.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    CollectionRoutingModule
  ],
  declarations: [CollectionComponent, SpecimenViewComponent, SpecimenLocationViewComponent]
})
export class CollectionModule { }
