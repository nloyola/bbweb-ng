import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './components/admin/admin.component';
import { AuthGuard } from '@app/core/guards';
import { PageNotFoundComponent } from '@app/shared/components/page-not-found/page-not-found.component';

const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumbs: 'Admin'
    },
    {
    path: '**',
    component: PageNotFoundComponent
  }
  }
];

@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
