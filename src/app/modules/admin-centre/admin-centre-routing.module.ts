import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards';
import { CentreResolver } from '../admin-study/services/centre-resolver.service';
import { CentreAddComponent } from './components/centre-add/centre-add.component';
import { CentreLocationAddComponent } from './components/centre-location-add/centre-location-add.component';
import { CentreLocationsComponent } from './components/centre-locations/centre-locations.component';
import { CentreStudiesComponent } from './components/centre-studies/centre-studies.component';
import { CentreSummaryComponent } from './components/centre-summary/centre-summary.component';
import { CentreViewComponent } from './components/centre-view/centre-view.component';
import { CentresAdminComponent } from './components/centres-admin/centres-admin.component';

export const routes: Routes = [
  {
    path: 'centres',
    canActivate: [ AuthGuard ],
    data: {
      breadcrumbs: 'Centres'
    },
    children: [
      {
        path: '',
        component: CentresAdminComponent
      },
      {
        path: 'add',
        component: CentreAddComponent,
        data: {
          breadcrumbs: 'Add'
        }
      },
      {
        path: ':slug',
        component: CentreViewComponent,
        resolve: {
          centre: CentreResolver
        },
        data: {
          breadcrumbs: '{{ centre.name }}'
        },
        children: [
          { path: '', redirectTo: 'summary', pathMatch: 'full' },
          {
            path: 'summary',
            component: CentreSummaryComponent,
            data: {
              breadcrumbs: 'Summary'
            }
          },
          {
            path: 'studies',
            component: CentreStudiesComponent,
            data: {
              breadcrumbs: 'Studies'
            }
          },
          {
            path: 'locations',
            data: {
              breadcrumbs: 'Locations'
            },
            children: [
              {
                path: '',
                component: CentreLocationsComponent,
              },
              {
                path: 'add',
                component: CentreLocationAddComponent,
                data: {
                  breadcrumbs: 'Add'
                }
              },
              {
                path: ':locationId',
                component: CentreLocationAddComponent,
                data: {
                  breadcrumbs: 'Update'
                }
              }
            ]
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
export class AdminCentreRoutingModule { }
