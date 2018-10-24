import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards';
import { StudyCollectionComponent } from '@app/modules/admin-study/components/study-collection/study-collection.component';
import { StudyParticipantsComponent } from '@app/modules/admin-study/components/study-participants/study-participants.component';
import { StudyProcessingComponent } from '@app/modules/admin-study/components/study-processing/study-processing.component';
import { StudySummaryComponent } from '@app/modules/admin-study/components/study-summary/study-summary.component';
import { StudyViewComponent } from '@app/modules/admin-study/components/study-view/study-view.component';
import { StudyResolver } from '@app/modules/admin-study/services/study-resolver.service';
import { CollectedSpecimenDefinitionAddContainer } from './components/collected-specimen-definition-add/collected-specimen-definition-add.container';
import { CollectionAnnotationTypeAddContainer } from './components/collection-annotation-type-add/collection-annotation-type-add.container';
import { EventTypeAddComponent } from './components/event-type-add/event-type-add.component';
import { ParticipantAnnotationTypeAddComponent } from './components/participant-annotation-type-add/participant-annotation-type-add.component';
import { StudiesAdminComponent } from './components/studies-admin/studies-admin.component';
import { StudyAddComponent } from './components/study-add/study-add.component';

export const routes: Routes = [
  {
    path: 'studies',
    canActivate: [AuthGuard],
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
        component: StudyAddComponent,
        data: {
          breadcrumbs: 'Add'
        }
      },
      {
        path: 'view/:slug',
        component: StudyViewComponent,
        resolve: {
          study: StudyResolver
        },
        data: {
          breadcrumbs: '{{ study.name }}'
        },
        children: [
          { path: '', redirectTo: 'summary', pathMatch: 'full' },
          {
            path: 'summary',
            component: StudySummaryComponent,
            data: {
              breadcrumbs: 'Summary'
            }
          },
          {
            path: 'participants',
            data: {
              breadcrumbs: 'Participants'
            },
            children: [
              {
                path: '',
                component: StudyParticipantsComponent,
              },
              {
                path: 'add',
                component: ParticipantAnnotationTypeAddComponent,
                data: {
                  breadcrumbs: 'Add'
                }
              },
              {
                path: ':annotationTypeId',
                component: ParticipantAnnotationTypeAddComponent,
                data: {
                  breadcrumbs: 'Update'
                }
              }
            ]
          },
          {
            path: 'collection',
            data: {
              breadcrumbs: 'Collection'
            },
            children: [
              {
                path: '',
                component: StudyCollectionComponent,
              },
              {
                path: 'add',
                component: EventTypeAddComponent,
                data: {
                  breadcrumbs: 'Add Event'
                }
              },
              {
                path: ':eventTypeSlug/annotationAdd',
                component: CollectionAnnotationTypeAddContainer,
                data: {
                  breadcrumbs: 'Add Annotation'
                }
              },
              {
                path: ':eventTypeSlug/annotation/:annotationTypeId',
                component: CollectionAnnotationTypeAddContainer,
                data: {
                  breadcrumbs: 'Update Annotation'
                }
              },
              {
                path: ':eventTypeSlug/spcDefAdd',
                component: CollectedSpecimenDefinitionAddContainer,
                data: {
                  breadcrumbs: 'Add Specimen'
                }
              },
              {
                path: ':eventTypeSlug/spcDef/:specimenDefinitionId',
                component: CollectedSpecimenDefinitionAddContainer,
                data: {
                  breadcrumbs: 'Update Specimen'
                }
              }
            ]
          },
          {
            path: 'processing',
            component: StudyProcessingComponent,
            data: {
              breadcrumbs: 'Processing'
            }
          },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminStudyRoutingModule { }
