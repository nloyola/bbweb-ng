import { SearchParams } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { RootStoreState, CentreStoreActions, CentreStoreSelectors } from '@app/root-store';
import { EntityTypeahead } from '@app/shared/typeaheads/entity.typeahead';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class CentreAddTypeahead extends EntityTypeahead<Centre> {

  constructor(private store$: Store<RootStoreState.State>,
              resultsMapper: (entities: Centre[]) => Centre[]) {
    super(resultsMapper);
  }

  protected termMapper(term: string): Observable<Centre[]> {
    const searchParams = new SearchParams(`name:like:${term}`);
    this.store$.dispatch(new CentreStoreActions.SearchCentresRequest({ searchParams }));

    return this.store$.pipe(
      select(CentreStoreSelectors.selectCentreSearchRepliesAndEntities),
      filter(x => !!x),
      map(x => x.entities));
  }

  typeaheadFormatter(centre: Centre): string {
    return centre.name;
  }

}
