import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards';
import { CentreResolver } from '../admin-study/services/centre-resolver.service';
import { ShipmentResolver } from '../admin-study/services/shipment-resolver.service';
import { CentreShipmentsDetailsComponent } from './components/centre-shipments-details/centre-shipments-details.component';
import { CentreShipmentsPageComponent } from './components/centre-shipments-page/centre-shipments-page.component';
import { ShipmentAddPageComponent } from './components/shipment-add-page/shipment-add-page.component';
import { ShippingPageComponent } from './components/shipping-page/shipping-page.component';
import { ShipmentViewComponent } from './components/shipment-view/shipment-view.component';

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
              breadcrumbs: 'Incoming'
            }
          },
          {
            path: 'outgoing',
            children: ShippingCentreChildStates,
            data: {
              breadcrumbs: 'Outgoing'
            }
          },
          {
            path: 'completed',
            children: ShippingCentreChildStates,
            data: {
              breadcrumbs: 'Completed'
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
