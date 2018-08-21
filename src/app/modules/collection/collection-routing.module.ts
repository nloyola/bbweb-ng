import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CollectionComponent } from './components/collection/collection.component';
import { AuthGuard } from '@app/core/guards';

const routes: Routes = [
  {
    path: 'collection',
    component: CollectionComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }
