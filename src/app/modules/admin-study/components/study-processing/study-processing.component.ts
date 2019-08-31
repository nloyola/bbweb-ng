import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchParams } from '@app/domain';
import {
  CollectionEventType,
  ProcessingType,
  Study,
  CollectedSpecimenDefinitionName
} from '@app/domain/studies';
import {
  EventTypeStoreActions,
  EventTypeStoreSelectors,
  RootStoreState,
  StudyStoreSelectors
} from '@app/root-store';
import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpecimenDefinitionNamesByStudy } from '@app/root-store/event-type/event-type.reducer';

interface StudyData {
  study: Study;
  hasSpecimenDefinitions: boolean;
}

@Component({
  selector: 'app-study-processing',
  templateUrl: './study-processing.component.html',
  styleUrls: ['./study-processing.component.scss']
})
export class StudyProcessingComponent implements OnInit {
  studyData$: Observable<StudyData>;
  private modificationsAllowed = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const entitiesSelector = createSelector(
      StudyStoreSelectors.selectAllStudies,
      EventTypeStoreSelectors.selectSpecimenDefinitionNames,
      (studies: Study[], specimenDefinitionNames: SpecimenDefinitionNamesByStudy) => {
        const result = {
          studies,
          specimenDefinitionNames
        };
        return result;
      }
    );

    this.studyData$ = this.store$.pipe(
      select(entitiesSelector),
      map(entities => {
        const studyEntity = entities.studies.find(
          s => s.slug === this.route.parent.parent.snapshot.params.slug
        );
        if (studyEntity) {
          const study = studyEntity instanceof Study ? studyEntity : new Study().deserialize(studyEntity);

          this.modificationsAllowed = study.isDisabled();

          const hasSpecimenDefinitions =
            entities.specimenDefinitionNames &&
            entities.specimenDefinitionNames[study.slug] !== undefined &&
            entities.specimenDefinitionNames[study.slug].length > 0;

          return { study, hasSpecimenDefinitions };
        }
        return undefined;
      })
    );

    this.store$.dispatch(
      EventTypeStoreActions.getSpecimenDefinitionNamesRequest({
        studySlug: this.route.parent.parent.snapshot.params.slug
      })
    );
  }

  addProcessingTypeSelected() {
    if (!this.modificationsAllowed) {
      throw new Error('modifications not allowed');
    }

    this.router.navigate(['../add'], { relativeTo: this.route });
  }

  processingTypeSelected(processingType: ProcessingType) {
    this.router.navigate([processingType.slug], { relativeTo: this.route });
  }
}
