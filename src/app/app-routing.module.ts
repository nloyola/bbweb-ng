import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@app/shared/components/page-not-found/page-not-found.component';
import { UnauthorizedPageComponent } from './shared/components/unauthorized-page/unauthorized-page.component';
import { ServerErrorPageComponent } from './shared/components/server-error-page/server-error-page.component';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('@app/modules/admin/admin.module').then(m => m.AdminModule),
    data: {
      breadcrumbs: 'Admin'
    }
  },
  {
    path: 'collection',
    loadChildren: () => import('@app/modules/collection/collection.module').then(m => m.CollectionModule),
    data: {
      breadcrumbs: 'Collection'
    }
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: '401',
    component: UnauthorizedPageComponent
  },
  {
    path: 'server-error',
    component: ServerErrorPageComponent
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
