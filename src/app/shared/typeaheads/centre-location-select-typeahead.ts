import { CentreLocationInfo } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { EntitySelectTypeahead } from './entity-select-typeahead';

export type CentreLocationResultsMapper = (entities: CentreLocationInfo[]) => CentreLocationInfo[];

export class CentreLocationSelectTypeahead extends EntitySelectTypeahead<CentreLocationInfo> {
  constructor(private store$: Store<RootStoreState.State>, resultsMapper: CentreLocationResultsMapper) {
    super(resultsMapper);
  }

  protected termMapper(term: string): Observable<CentreLocationInfo[]> {
    this.store$.dispatch(CentreStoreActions.searchLocationsRequest({ filter: term }));

    return this.store$.pipe(
      select(CentreStoreSelectors.selectLastLocationsSearchReplies),
      filter(x => x !== undefined)
    );
  }

  formatter(centreLocationInfo: CentreLocationInfo): string {
    return centreLocationInfo.combinedName;
  }
}
