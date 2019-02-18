import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@app/shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: '@app/modules/admin/admin.module#AdminModule',
    data: {
      breadcrumbs: 'Admin'
    }
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        // enableTracing: true,
        enableTracing: false,
      }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
