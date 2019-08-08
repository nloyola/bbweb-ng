import { Centre } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EntitySelectTypeahead } from './entity-select-typeahead';

export type CentreResultsMapper = (entities: Centre[]) => Centre[];

export class CentreSelectTypeahead extends EntitySelectTypeahead<Centre> {
  constructor(private store$: Store<RootStoreState.State>, resultsMapper: CentreResultsMapper) {
    super(resultsMapper);
  }

  protected termMapper(term: string): Observable<Centre[]> {
    const searchParams = { filter: `name:like:${term}` };
    this.store$.dispatch(CentreStoreActions.searchCentresRequest({ searchParams }));

    return this.store$.pipe(
      select(CentreStoreSelectors.selectCentreSearchRepliesAndEntities),
      filter(x => !!x),
      map(x => x.entities)
    );
  }

  formatter(centre: Centre): string {
    return centre.name;
  }
}
