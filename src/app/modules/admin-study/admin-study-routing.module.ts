import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudyCollectionComponent } from '@app/modules/admin-study/components/study-collection/study-collection.component';
import { StudyParticipantsComponent } from '@app/modules/admin-study/components/study-participants/study-participants.component';
import { StudyProcessingComponent } from '@app/modules/admin-study/components/study-processing/study-processing.component';
import { StudySummaryComponent } from '@app/modules/admin-study/components/study-summary/study-summary.component';
import { StudyViewComponent } from '@app/modules/admin-study/components/study-view/study-view.component';
import { StudyResolver } from '@app/modules/admin-study/services/study-resolver.service';
import { StudiesAdminComponent } from './components/studies-admin/studies-admin.component';
import { StudyAddComponent } from './components/study-add/study-add.component';
import { AuthGuard } from '@app/core/guards';
import { AnnotationTypeAddComponent } from '@app/shared/components/annotation-type-add/annotation-type-add.component';

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
            component: StudyParticipantsComponent,
            data: {
              breadcrumbs: 'Participants'
            }
          },
          {
            path: 'collection',
            component: StudyCollectionComponent,
            data: {
              breadcrumbs: 'Collection'
            }
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
