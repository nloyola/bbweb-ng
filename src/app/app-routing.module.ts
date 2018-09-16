import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { PageNotFoundComponent } from '@app/shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: '@app/modules/admin/admin.module#AdminModule'
  },
  {
    path: 'collection',
    loadChildren: '@app/modules/collection/collection.module#CollectionModule'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        enableTracing: false, /* true, */
      }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
