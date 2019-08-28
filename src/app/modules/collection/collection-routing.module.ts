import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards';
import { CollectionPageComponent } from './components/collection-page/collection-page.component';
import { ParticipantAddPageComponent } from './components/participant-add-page/participant-add-page.component';
import { ParticipantSummaryComponent } from './components/participant-summary/participant-summary.component';
import { ParticipantViewPageComponent } from './components/participant-view-page/participant-view-page.component';
import { EventAddFormComponent } from './components/event-add-form/event-add-form.component';
import { ParticipantEventsComponent } from './components/participant-events/participant-events.component';
import { EventViewComponent } from './components/event-view/event-view.component';
import { ParticipantResolver, CollectionEventResolver } from '@app/core/resolvers';

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
        },
        children: [
          { path: '', redirectTo: 'summary', pathMatch: 'full' },
          {
            path: 'summary',
            component: ParticipantSummaryComponent,
            data: {
              breadcrumbs: 'Summary'
            }
          },
          {
            path: 'collection',
            children: [
              { path: '', redirectTo: 'view', pathMatch: 'full' },
              {
                path: 'add',
                component: EventAddFormComponent,
                data: {
                  breadcrumbs: 'Add Event'
                }
              },
              {
                path: 'view',
                component: ParticipantEventsComponent,
                children: [
                  {
                    path: ':visitNumber',
                    resolve: {
                      event: CollectionEventResolver
                    },
                    data: {
                      breadcrumbs: 'Visit {{event.visitNumber}}'
                    },
                    children: [
                      {
                        path: '',
                        component: EventViewComponent
                      }
                    ]
                  }
                ]
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
export class CollectionRoutingModule {}
