import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards';
import { CentreResolver, ShipmentResolver } from '@app/core/resolvers';
import {
  CentreShipmentsDetailsComponent,
  CentreShipmentsViewMode
} from './components/centre-shipments-details/centre-shipments-details.component';
import { CentreShipmentsPageComponent } from './components/centre-shipments-page/centre-shipments-page.component';
import { ShipmentAddPageComponent } from './components/shipment-add-page/shipment-add-page.component';
import { ShipmentViewComponent } from './components/shipment-view/shipment-view.component';
import { ShippingPageComponent } from './components/shipping-page/shipping-page.component';
import { UnpackedShipmentInfoComponent } from './components/unpacked-shipment-info/unpacked-shipment-info.component';
import { UnpackedShipmentUnpackComponent } from './components/unpacked-shipment-unpack/unpacked-shipment-unpack.component';
import { UnpackedShipmentReceivedComponent } from './components/unpacked-shipment-received/unpacked-shipment-received.component';
import { UnpackedShipmentMissingComponent } from './components/unpacked-shipment-missing/unpacked-shipment-missing.component';
import { UnpackedShipmentExtraComponent } from './components/unpacked-shipment-extra/unpacked-shipment-extra.component';

const ShippingCentreChildStates = [
  { path: '', redirectTo: 'all', pathMatch: 'full' },
  {
    path: 'all',
    component: CentreShipmentsDetailsComponent
  },
  {
    path: 'view/:id',
    component: ShipmentViewComponent,
    resolve: {
      shipment: ShipmentResolver
    },
    children: [
      // these children are only accessible when shipment is in "unpacked" state
      { path: '', redirectTo: 'information', pathMatch: 'full' },
      {
        path: 'information',
        component: UnpackedShipmentInfoComponent
      },
      {
        path: 'unpacked-specimens',
        component: UnpackedShipmentUnpackComponent
      },
      {
        path: 'received-specimens',
        component: UnpackedShipmentReceivedComponent
      },
      {
        path: 'missing-specimens',
        component: UnpackedShipmentMissingComponent
      },
      {
        path: 'extra-specimens',
        component: UnpackedShipmentExtraComponent
      }
    ],
    data: {
      breadcrumbs: '{{shipment.courierName}}: {{shipment.trackingNumber}}'
    }
  }
];

const routes: Routes = [
  {
    path: 'shipping',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ShippingPageComponent
      },
      {
        path: 'add',
        component: ShipmentAddPageComponent,
        data: {
          breadcrumbs: 'Add Shipment'
        }
      },
      {
        path: ':slug',
        component: CentreShipmentsPageComponent,
        resolve: {
          centre: CentreResolver
        },
        data: {
          breadcrumbs: '{{ centre.name }}'
        },
        children: [
          { path: '', redirectTo: 'incoming', pathMatch: 'full' },
          {
            path: 'incoming',
            children: ShippingCentreChildStates,
            data: {
              breadcrumbs: 'Incoming',
              mode: CentreShipmentsViewMode.Incoming
            }
          },
          {
            path: 'outgoing',
            children: ShippingCentreChildStates,
            data: {
              breadcrumbs: 'Outgoing',
              mode: CentreShipmentsViewMode.Outgoing
            }
          },
          {
            path: 'completed',
            children: ShippingCentreChildStates,
            data: {
              breadcrumbs: 'Completed',
              mode: CentreShipmentsViewMode.Completed
            }
          }
        ]
      }
    ],
    data: {
      breadcrumbs: 'Shipping'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingRoutingModule {}
