import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionComponent } from './components/collection/collection.component';

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
