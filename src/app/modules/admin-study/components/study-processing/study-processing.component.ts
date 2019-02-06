import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchParams } from '@app/domain';
import { CollectionEventType, ProcessingType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface StudyData {
  study: Study;
  hasEventTypes: boolean;
}

@Component({
  selector: 'app-study-processing',
  templateUrl: './study-processing.component.html',
  styleUrls: ['./study-processing.component.scss']
})
export class StudyProcessingComponent implements OnInit {

  studyData$: Observable<StudyData>;
  haveEventTypes: boolean;
  private modificationsAllowed = false;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const entitiesSelector = createSelector(
      StudyStoreSelectors.selectAllStudies,
      EventTypeStoreSelectors.selectAllEventTypes,
      (studies: Study[], eventTypes: CollectionEventType[]) => {
        const result = { studies, eventTypes };
        return result;
      });

    this.studyData$ = this.store$
      .pipe(
        select(entitiesSelector),
        map(entities => {
          const studyEntity =
            entities.studies.find(s => s.slug === this.route.parent.parent.snapshot.params.slug);
          if (studyEntity) {
            const study = (studyEntity instanceof Study)
              ? studyEntity :  new Study().deserialize(studyEntity);

            this.modificationsAllowed = study.isDisabled();
            this.store$.dispatch(new EventTypeStoreActions.SearchEventTypesRequest({
              studySlug: study.slug,
              studyId: study.id,
              searchParams: new SearchParams()
            }));

            const hasEventTypes = (entities.eventTypes.find(et => et.studyId === study.id) !== undefined);

            return { study, hasEventTypes };
          }
          return undefined;
        }));
  }

  addProcessingTypeSelected() {
    if (!this.modificationsAllowed) {
      throw new Error('modifications not allowed');
    }

    this.router.navigate([ '../add' ], { relativeTo: this.route });
  }

  processingTypeSelected(processingType: ProcessingType) {
    this.router.navigate([ processingType.slug ], { relativeTo: this.route });
  }

}
