import { SearchParams } from '@app/domain';
import { User } from '@app/domain/users';
import { RootStoreState, UserStoreActions, UserStoreSelectors } from '@app/root-store';
import { EntityTypeahead } from '@app/shared/typeaheads/entity.typeahead';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class UserAddTypeahead extends EntityTypeahead<User> {

  constructor(private store$: Store<RootStoreState.State>,
              resultsMapper: (entities: User[]) => User[]) {
    super(resultsMapper);
  }

  protected termMapper(term: string): Observable<User[]> {
    const searchParams = new SearchParams(`name:like:${term}`);
    this.store$.dispatch(new UserStoreActions.SearchUsersRequest({ searchParams }));

    return this.store$.pipe(
      select(UserStoreSelectors.selectUserSearchRepliesAndEntities),
      filter(x => !!x),
      map(x => x.entities));
  }

  typeaheadFormatter(user: User): string {
    return user.name;
  }

}
