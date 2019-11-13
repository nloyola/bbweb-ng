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
import { ModalShipmentHasNoSpecimensComponent } from './components/modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalShipmentHasSpecimensComponent } from './components/modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentRemoveComponent } from './components/modal-shipment-remove/modal-shipment-remove.component';
import { ShipmentAddItemsComponent } from './components/shipment-add-items/shipment-add-items.component';
import { ShipmentAddPageComponent } from './components/shipment-add-page/shipment-add-page.component';
import { ShipmentAddSpecimensCardComponent } from './components/shipment-add-specimens-card/shipment-add-specimens-card.component';
import { ShipmentInformationCardComponent } from './components/shipment-information-card/shipment-information-card.component';
import { ShipmentNotInCreatedModalComponent } from './components/shipment-not-in-created-modal/shipment-not-in-created-modal.component';
import { ShipmentSpecimensTableComponent } from './components/shipment-specimens-table/shipment-specimens-table.component';
import { ShipmentViewPackedComponent } from './components/shipment-view-packed/shipment-view-packed.component';
import { ShipmentViewSentComponent } from './components/shipment-view-sent/shipment-view-sent.component';
import { ShipmentsTableViewComponent } from './components/shipments-table-view/shipments-table-view.component';
import { ShippingCentresSelectComponent } from './components/shipping-centres-select/shipping-centres-select.component';
import { ShippingPageComponent } from './components/shipping-page/shipping-page.component';
import { ShippingRoutingModule } from './shipping-routing.module';
import { ShipmentViewComponent } from './components/shipment-view/shipment-view.component';
import { ModalSpecimensInOtherShipmentComponent } from './components/modal-specimens-in-other-shipment/modal-specimens-in-other-shipment.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ShipmentSpecimensTableContainerComponent } from './components/shipment-specimens-table/shipment-specimens-table.container';
import { SpecimenViewModalComponent } from '../modals/components/specimen-view-modal/specimen-view-modal.component';
import { ShipmentViewReceivedComponent } from './components/shipment-view-received/shipment-view-received.component';
import { ShipmentViewLostComponent } from './components/shipment-view-lost/shipment-view-lost.component';
import { ShipmentViewUnpackedComponent } from './components/shipment-view-unpacked/shipment-view-unpacked.component';
import { UnpackedShipmentInfoComponent } from './components/unpacked-shipment-info/unpacked-shipment-info.component';
import { UnpackedShipmentUnpackComponent } from './components/unpacked-shipment-unpack/unpacked-shipment-unpack.component';
import { UnpackedShipmentReceivedComponent } from './components/unpacked-shipment-received/unpacked-shipment-received.component';
import { UnpackedShipmentMissingComponent } from './components/unpacked-shipment-missing/unpacked-shipment-missing.component';
import { UnpackedShipmentExtraComponent } from './components/unpacked-shipment-extra/unpacked-shipment-extra.component';
import { ShipmentViewCompletedComponent } from './components/shipment-view-completed/shipment-view-completed.component';
import { ShipmentViewerComponent } from './components/shipment-viewer/shipment-viewer.component';

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
    ModalInputModule,
    FontAwesomeModule
  ],
  declarations: [
    CentreShipmentsDetailsComponent,
    CentreShipmentsPageComponent,
    ModalInputCentreLocationComponent,
    ModalInputCentreLocationComponent,
    ModalShipmentHasNoSpecimensComponent,
    ModalShipmentHasSpecimensComponent,
    ModalShipmentRemoveComponent,
    ModalSpecimensInOtherShipmentComponent,
    ShipmentAddItemsComponent,
    ShipmentAddPageComponent,
    ShipmentAddSpecimensCardComponent,
    ShipmentInformationCardComponent,
    ShipmentNotInCreatedModalComponent,
    ShipmentSpecimensTableComponent,
    ShipmentSpecimensTableContainerComponent,
    ShipmentViewComponent,
    ShipmentViewPackedComponent,
    ShipmentViewSentComponent,
    ShipmentViewReceivedComponent,
    ShipmentViewUnpackedComponent,
    ShipmentViewLostComponent,
    ShipmentsTableViewComponent,
    ShippingCentresSelectComponent,
    ShippingPageComponent,
    UnpackedShipmentInfoComponent,
    UnpackedShipmentUnpackComponent,
    UnpackedShipmentReceivedComponent,
    UnpackedShipmentMissingComponent,
    UnpackedShipmentExtraComponent,
    ShipmentViewCompletedComponent,
    ShipmentViewerComponent
  ],
  entryComponents: [
    ModalInputCentreLocationComponent,
    ModalInputCentreLocationComponent,
    ModalShipmentHasNoSpecimensComponent,
    ModalShipmentHasSpecimensComponent,
    ModalShipmentRemoveComponent,
    ModalSpecimensInOtherShipmentComponent,
    SpecimenViewModalComponent
  ]
})
export class ShippingModule {}
