import { SearchParams } from '@app/domain';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { EntityTypeahead } from '@app/shared/typeaheads/entity.typeahead';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class StudyAddTypeahead extends EntityTypeahead<Study> {

  constructor(private store$: Store<RootStoreState.State>,
              resultsMapper: (entities: Study[]) => Study[]) {
    super(resultsMapper);
  }

  protected termMapper(term: string): Observable<Study[]> {
    const searchParams = new SearchParams(`name:like:${term}`);
    this.store$.dispatch(StudyStoreActions.searchStudiesRequest({ searchParams }));

    return this.store$.pipe(
      select(StudyStoreSelectors.selectStudySearchRepliesAndEntities),
      filter(x => !!x),
      map(x => x.entities));
  }

  typeaheadFormatter(study: Study): string {
    return study.name;
  }

}
