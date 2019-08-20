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
import { ShipmentInformationCardComponent } from './components/shipment-information-card/shipment-information-card.component';
import { ShipmentAddItemsPageComponent } from './components/shipment-add-items-page/shipment-add-items-page.component';
import { ShipmentAddSpecimensCardComponent } from './components/shipment-add-specimens-card/shipment-add-specimens-card.component';
import { ModalInputModule } from '../modals/modals.module';
import { ShipmentSpecimensTableComponent } from './components/shipment-specimens-table/shipment-specimens-table.component';
import { ShipmentPageButtonsComponent } from './components/shipment-page-buttons/shipment-page-buttons.component';
import { ModalInputCentreLocationComponent } from './components/modal-input-centre-location/modal-input-centre-location.component';
import { ShipmentNotInCreatedModalComponent } from '../modals/components/shipment-not-in-created-modal/shipment-not-in-created-modal.component';
import { ShipmentRemoveModalComponent } from '../modals/components/shipment-remove-modal/shipment-remove-modal.component';
import { ModalInputDateTimeComponent } from '@app/modules/modals/components/modal-input-date/modal-input-date-time.component';
import { ModalInputDoubleDateComponent } from '../modals/components/modal-input-double-date/modal-input-double-date.component';
import { ModalShipmentBackToCreatedComponent } from '../modals/components/modal-shipment-back-to-created/modal-shipment-back-to-created.component';
import { ModalShipmentBackToPackedComponent } from '../modals/components/modal-shipment-back-to-packed/modal-shipment-back-to-packed.component';
import { ModalShipmentTagAsLostComponent } from '../modals/components/modal-shipment-tag-as-lost/modal-shipment-tag-as-lost.component';
import { ModalShipmentHasSpecimensComponent } from '../modals/components/modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentHasNoSpecimensComponent } from '../modals/components/modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalSpecimensExistInAnotherShipmentComponent } from '../modals/components/modal-specimens-exist-in-another-shipment/modal-specimens-exist-in-another-shipment.component';

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
    MatSortModule,
    ModalInputModule
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
    ShipmentInformationCardComponent,
    ShipmentAddItemsPageComponent,
    ShipmentAddSpecimensCardComponent,
    ShipmentSpecimensTableComponent,
    ShipmentPageButtonsComponent,
    ModalInputCentreLocationComponent,
    ModalInputCentreLocationComponent,
    ShipmentPageButtonsComponent
  ],
  entryComponents: [
    ShipmentNotInCreatedModalComponent,
    ModalShipmentHasSpecimensComponent,
    ShipmentRemoveModalComponent,
    ModalInputDateTimeComponent,
    ModalInputDoubleDateComponent,
    ModalShipmentBackToCreatedComponent,
    ModalShipmentBackToPackedComponent,
    ModalShipmentTagAsLostComponent,
    ModalShipmentHasNoSpecimensComponent,
    ModalSpecimensExistInAnotherShipmentComponent
  ]
})
export class ShippingModule {}
