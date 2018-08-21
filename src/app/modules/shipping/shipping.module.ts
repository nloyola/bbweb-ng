import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { ShippingRoutingModule } from './shipping-routing.module';
import { ShippingComponent } from './components/shipping/shipping.component';

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
