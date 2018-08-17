import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@app/material.module';
import { SharedModule } from '../shared/shared.module';
import { ShippingRoutingModule } from './shipping-routing.module';
import { ShippingComponent } from './shipping/shipping.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    ShippingRoutingModule
  ],
  declarations: [ShippingComponent]
})
export class ShippingModule { }
