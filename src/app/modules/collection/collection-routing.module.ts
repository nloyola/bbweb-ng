import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CollectionComponent } from './components/collection/collection.component';
import { SpecimenViewComponent } from './components/specimen-view/specimen-view.component';
import { AuthGuard } from '@app/core/guards';

const routes: Routes = [
   {
    path: '',
    canActivate: [AuthGuard],
    data: {
      breadcrumbs: 'Collection'
    },
    children: [
      {
        path: '',
        component: CollectionComponent
      },
      {
        path: 'specimen',
        component: SpecimenViewComponent,
        data: {
          breadcrumbs: 'Specimen U0941-2'
        }
      },
    ]
   }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }
