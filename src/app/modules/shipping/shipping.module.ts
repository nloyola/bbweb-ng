import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule, MatTableModule } from '@angular/material';
import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CentreShipmentsCompletedComponent } from './components/centre-shipments-completed/centre-shipments-completed.component';
import { CentreShipmentsIncomingComponent } from './components/centre-shipments-incoming/centre-shipments-incoming.component';
import { CentreShipmentsOutgoingComponent } from './components/centre-shipments-outgoing/centre-shipments-outgoing.component';
import { CentreShipmentsPageComponent } from './components/centre-shipments-page/centre-shipments-page.component';
import { ShipmentsTableViewComponent } from './components/shipments-table-view/shipments-table-view.component';
import { ShippingCentresSelectComponent } from './components/shipping-centres-select/shipping-centres-select.component';
import { ShippingPageComponent } from './components/shipping-page/shipping-page.component';
import { ShippingRoutingModule } from './shipping-routing.module';
import { ShipmentAddPageComponent } from './components/shipment-add-page/shipment-add-page.component';
import { ShipmentViewPageComponent } from './components/shipment-view-page/shipment-view-page.component';
import { ShipmentInformationComponent } from './components/shipment-information/shipment-information.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    ShippingRoutingModule,
    NgbModule,
    MatTableModule,
    MatSortModule
  ],
  declarations: [
    ShippingPageComponent,
    ShippingCentresSelectComponent,
    CentreShipmentsPageComponent,
    CentreShipmentsIncomingComponent,
    CentreShipmentsOutgoingComponent,
    CentreShipmentsCompletedComponent,
    ShipmentsTableViewComponent,
    ShipmentAddPageComponent,
    ShipmentViewPageComponent,
    ShipmentInformationComponent
  ]
})
export class ShippingModule {}
