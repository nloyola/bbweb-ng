import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards';
import { StudyCollectionComponent } from '@app/modules/admin-study/components/study-collection/study-collection.component';
import { StudyParticipantsComponent } from '@app/modules/admin-study/components/study-participants/study-participants.component';
import { StudyProcessingComponent } from '@app/modules/admin-study/components/study-processing/study-processing.component';
import { StudySummaryComponent } from '@app/modules/admin-study/components/study-summary/study-summary.component';
import { StudyViewComponent } from '@app/modules/admin-study/components/study-view/study-view.component';
import { StudyResolver } from '@app/modules/admin-study/services/study-resolver.service';
import { CollectedSpecimenDefinitionAddContainerComponent } from './components/collected-specimen-definition-add/collected-specimen-definition-add.container';
import { CollectionAnnotationTypeAddContainerComponent } from './components/collection-annotation-type-add/collection-annotation-type-add.container';
import { EventTypeAddComponent } from './components/event-type-add/event-type-add.component';
import { EventTypeViewContainerComponent } from './components/event-type-view/event-type-view.container';
import { ParticipantAnnotationTypeAddContainerComponent } from './components/participant-annotation-type-add/participant-annotation-type-add.container';
import { ProcessingAnnotationTypeAddContainerComponent } from './components/processing-annotation-type-add/processing-annotation-type-add.container';
import { ProcessingTypeAddComponent } from './components/processing-type-add/processing-type-add.component';
import { ProcessingTypeViewContainerComponent } from './components/processing-type-view/processing-type-view.container';
import { StudiesAdminComponent } from './components/studies-admin/studies-admin.component';
import { StudyAddComponent } from './components/study-add/study-add.component';
import { EventTypeResolver } from './services/event-type-resolver.service';
import { ProcessingTypeResolver } from './services/processing-type-resolver.service';

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
        path: ':slug',
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
                component: ParticipantAnnotationTypeAddContainerComponent,
                data: {
                  breadcrumbs: 'Add'
                }
              },
              {
                path: ':annotationTypeId',
                component: ParticipantAnnotationTypeAddContainerComponent,
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
              { path: '', redirectTo: 'view', pathMatch: 'full' },
              {
                path: 'add',
                component: EventTypeAddComponent,
                data: {
                  breadcrumbs: 'Add Event'
                }
              },
              {
                path: 'view',
                component: StudyCollectionComponent,
                children: [
                  {
                    path: ':eventTypeSlug',
                    resolve: {
                      eventType: EventTypeResolver
                    },
                    data: {
                      breadcrumbs: '{{eventType.name}}'
                    },
                    children: [
                      {
                        path: '',
                        component: EventTypeViewContainerComponent,
                      },
                      {
                        path: 'annotationAdd',
                        component: CollectionAnnotationTypeAddContainerComponent,
                        data: {
                          breadcrumbs: 'Add Annotation'
                        }
                      },
                      {
                        path: 'annotation/:annotationTypeId',
                        component: CollectionAnnotationTypeAddContainerComponent,
                        data: {
                          breadcrumbs: 'Update Annotation'
                        }
                      },
                      {
                        path: 'spcDefAdd',
                        component: CollectedSpecimenDefinitionAddContainerComponent,
                        data: {
                          breadcrumbs: 'Add Specimen'
                        }
                      },
                      {
                        path: 'spcDef/:specimenDefinitionId',
                        component: CollectedSpecimenDefinitionAddContainerComponent,
                        data: {
                          breadcrumbs: 'Update Specimen'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: 'processing',
            data: {
              breadcrumbs: 'Processing'
            },
            children: [
              { path: '', redirectTo: 'view', pathMatch: 'full' },
              {
                path: 'add',
                component: ProcessingTypeAddComponent,
                data: {
                  breadcrumbs: 'Add Specimen'
                }
              },
              {
                path: 'view',
                component: StudyProcessingComponent,
                children: [
                  {
                    path: ':processingTypeSlug',
                    resolve: {
                      processingType: ProcessingTypeResolver
                    },
                    data: {
                      breadcrumbs: '{{processingType.name}}'
                    },
                    children: [
                      {
                        path: '',
                        component: ProcessingTypeViewContainerComponent,
                      },
                      {
                        path: 'annotationAdd',
                        component: ProcessingAnnotationTypeAddContainerComponent,
                        data: {
                          breadcrumbs: 'Add Annotation'
                        }
                      },
                      {
                        path: 'annotation/:annotationTypeId',
                        component: ProcessingAnnotationTypeAddContainerComponent,
                        data: {
                          breadcrumbs: 'Update Annotation'
                        }
                      },
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
export class AdminStudyRoutingModule { }
