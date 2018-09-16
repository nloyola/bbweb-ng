import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CollectionComponent } from './components/collection/collection.component';
import { SpecimenViewComponent } from './components/specimen-view/specimen-view.component';
import { SpecimenLocationViewComponent } from './components/specimen-location-view/specimen-location-view.component';
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
        data: {
          breadcrumbs: 'Specimen U0941-2'
        },
        children: [
          {
            path: '',
            component: SpecimenViewComponent
          },
          {
            path: 'locations',
            component: SpecimenLocationViewComponent,
            data: {
              breadcrumbs: 'locations'
            }
          }
        ]
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
