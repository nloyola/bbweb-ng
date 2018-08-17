import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@app/material.module';
import { SharedModule } from '../shared/shared.module';
import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionComponent } from './collection/collection.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    CollectionRoutingModule
  ],
  declarations: [CollectionComponent]
})
export class CollectionModule { }
