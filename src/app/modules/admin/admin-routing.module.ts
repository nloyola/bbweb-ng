import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './components/admin/admin.component';
import { StudiesAdminComponent } from './components/studies-admin/studies-admin.component';
import { StudyAddComponent } from './components/study-add/study-add.component';
import { AuthGuard } from '@app/core/guards';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: {
      breadcrumbs: 'Admin'
    },
    children: [
      {
        path: '',
        component: AdminComponent
      },
      {
        path: 'studies',
        data: {
          breadcrumbs: 'Studies'
        },
        children: [
          {
            path: '',
            component: StudiesAdminComponent
          },
          {
            path: 'add',
            component: StudyAddComponent
            data: {
              breadcrumbs: 'Add'
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
