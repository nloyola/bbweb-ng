import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule, MatTableModule } from '@angular/material';
import { MaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalInputModule } from '../modals/modals.module';
import { CentreShipmentsDetailsComponent } from './components/centre-shipments-details/centre-shipments-details.component';
import { CentreShipmentsPageComponent } from './components/centre-shipments-page/centre-shipments-page.component';
import { ModalInputCentreLocationComponent } from './components/modal-input-centre-location/modal-input-centre-location.component';
import { ModalShipmentBackToCreatedComponent } from './components/modal-shipment-back-to-created/modal-shipment-back-to-created.component';
import { ModalShipmentBackToPackedComponent } from './components/modal-shipment-back-to-packed/modal-shipment-back-to-packed.component';
import { ModalShipmentHasNoSpecimensComponent } from './components/modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalShipmentHasSpecimensComponent } from './components/modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentRemoveComponent } from './components/modal-shipment-remove/modal-shipment-remove.component';
import { ModalShipmentTagAsLostComponent } from './components/modal-shipment-tag-as-lost/modal-shipment-tag-as-lost.component';
import { ShipmentAddItemsComponent } from './components/shipment-add-items/shipment-add-items.component';
import { ShipmentAddPageComponent } from './components/shipment-add-page/shipment-add-page.component';
import { ShipmentAddSpecimensCardComponent } from './components/shipment-add-specimens-card/shipment-add-specimens-card.component';
import { ShipmentInformationCardComponent } from './components/shipment-information-card/shipment-information-card.component';
import { ShipmentNotInCreatedModalComponent } from './components/shipment-not-in-created-modal/shipment-not-in-created-modal.component';
import { ShipmentPageButtonsComponent } from './components/shipment-page-buttons/shipment-page-buttons.component';
import { ShipmentSpecimensTableComponent } from './components/shipment-specimens-table/shipment-specimens-table.component';
import { ShipmentViewPackedComponent } from './components/shipment-view-packed/shipment-view-packed.component';
import { ShipmentViewSentComponent } from './components/shipment-view-sent/shipment-view-sent.component';
import { ShipmentsTableViewComponent } from './components/shipments-table-view/shipments-table-view.component';
import { ShippingCentresSelectComponent } from './components/shipping-centres-select/shipping-centres-select.component';
import { ShippingPageComponent } from './components/shipping-page/shipping-page.component';
import { ShippingRoutingModule } from './shipping-routing.module';
import { ShipmentViewComponent } from './components/shipment-view/shipment-view.component';
import { ModalSpecimensExistInAnotherShipmentComponent } from './components/modal-specimens-exist-in-another-shipment/modal-specimens-exist-in-another-shipment.component';

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
    CentreShipmentsDetailsComponent,
    CentreShipmentsPageComponent,
    ModalInputCentreLocationComponent,
    ModalInputCentreLocationComponent,
    ModalShipmentBackToCreatedComponent,
    ModalShipmentBackToPackedComponent,
    ModalShipmentHasNoSpecimensComponent,
    ModalShipmentHasSpecimensComponent,
    ModalShipmentRemoveComponent,
    ModalShipmentTagAsLostComponent,
    ModalSpecimensExistInAnotherShipmentComponent,
    ShipmentAddItemsComponent,
    ShipmentAddPageComponent,
    ShipmentAddSpecimensCardComponent,
    ShipmentInformationCardComponent,
    ShipmentNotInCreatedModalComponent,
    ShipmentPageButtonsComponent,
    ShipmentPageButtonsComponent,
    ShipmentSpecimensTableComponent,
    ShipmentViewComponent,
    ShipmentViewPackedComponent,
    ShipmentViewSentComponent,
    ShipmentsTableViewComponent,
    ShippingCentresSelectComponent,
    ShippingPageComponent
  ],
  entryComponents: [
    ModalInputCentreLocationComponent,
    ModalInputCentreLocationComponent,
    ModalShipmentBackToCreatedComponent,
    ModalShipmentBackToPackedComponent,
    ModalShipmentHasNoSpecimensComponent,
    ModalShipmentHasSpecimensComponent,
    ModalShipmentRemoveComponent,
    ModalShipmentTagAsLostComponent,
    ModalSpecimensExistInAnotherShipmentComponent
  ]
})
export class ShippingModule {}
