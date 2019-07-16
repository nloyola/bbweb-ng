import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShippingPageComponent } from './components/shipping-page/shipping-page.component';
import { AuthGuard } from '@app/core/guards';
import { CentreShipmentsPageComponent } from './components/centre-shipments-page/centre-shipments-page.component';
import { CentreResolver } from '../admin-study/services/centre-resolver.service';
import { CentreShipmentsIncomingComponent } from './components/centre-shipments-incoming/centre-shipments-incoming.component';
import { CentreShipmentsOutgoingComponent } from './components/centre-shipments-outgoing/centre-shipments-outgoing.component';
import { CentreShipmentsCompletedComponent } from './components/centre-shipments-completed/centre-shipments-completed.component';
import { ShipmentAddPageComponent } from './components/shipment-add-page/shipment-add-page.component';

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
        path: 'shipment-view',
        component: ShipmentAddPageComponent,
        data: {
          breadcrumbs: '{{shipment.courierName}} {{shipment.trackingNumber}}'
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
            component: CentreShipmentsIncomingComponent,
            data: {
              breadcrumbs: 'Incoming'
            }
          },
          {
            path: 'outgoing',
            component: CentreShipmentsOutgoingComponent,
            data: {
              breadcrumbs: 'Outgoing'
            }
          },
          {
            path: 'completed',
            component: CentreShipmentsCompletedComponent,
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
