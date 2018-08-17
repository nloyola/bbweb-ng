import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShippingComponent } from './shipping/shipping.component';
import { AuthGuard } from '@app/guards';

const routes: Routes = [
  {
    path: 'shipping',
    component: ShippingComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingRoutingModule { }
