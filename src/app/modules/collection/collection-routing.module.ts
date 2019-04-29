import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards';
import { ParticipantResolver } from '../../../../participant-resolver.service';
import { CollectionPageComponent } from './components/collection-page/collection-page.component';
import { ParticipantAddPageComponent } from './components/participant-add-page/participant-add-page.component';
import { ParticipantViewPageComponent } from './components/participant-view-page/participant-view-page.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: CollectionPageComponent,
        data: {
          breadcrumbs: 'Collection'
        }
      },
      {
        path: 'participant-add/:uniqueId',
        component: ParticipantAddPageComponent,
        data: {
          breadcrumbs: 'Add Participant'
        }
      },
      {
        path: ':slug',
        component: ParticipantViewPageComponent,
        resolve: {
          participant: ParticipantResolver
        },
        data: {
          breadcrumbs: `Participant {{ participant.uniqueId }}`
        }
      }
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
