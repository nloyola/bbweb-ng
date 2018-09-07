import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import {
  faCog,
  faCheckCircle,
  faEllipsisV,
  faExclamationTriangle,
  faMinusCircle
} from '@fortawesome/free-solid-svg-icons';

import {
  RootStoreState,
  StudyStoreActions,
  StudyStoreSelectors
} from '@app/root-store';

import { StudyState, StudyCounts, Study } from '@app/domain/studies';
import { SearchFilters, EntityStateInfo, LabelledId, SearchParamsReply, PagedReply, SearchParams } from '@app/domain';
import { NameFilter, StateFilter, SearchFilter } from '@app/domain/search-filters';

@Component({
  selector: 'app-studies-admin',
  templateUrl: './studies-admin.component.html',
  styleUrls: ['./studies-admin.component.scss']
})
export class StudiesAdminComponent implements OnInit {

  counts$: Observable<StudyCounts>;
  isLoading$: Observable<boolean>;
  studies: Study[];

  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];

  hasNoEntitiesToDisplay: boolean = false;
  hasNoResultsToDisplay: boolean = false;
  hasResultsToDisplay: boolean = false;

  private filters: { [ name: string]: SearchFilter };

  results: any; /// should be of type SearchParamsReply

  currentPage: number
  faCog = faCog;
  faCheckCircle = faCheckCircle;
  faMinusCircle = faMinusCircle;
  faEllipsisV = faEllipsisV;
  faExclamationTriangle = faExclamationTriangle;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>) {
  }

  ngOnInit() {
    this.stateData = Object.keys(StudyState).map(state => ({
      id: state,
      label: state
    }));
    this.sortChoices = this.stateData;

    this.filters = {
      nameFilter: new NameFilter(),
      stateFilter: new StateFilter(this.sortChoices, 'all', true)
    };

    this.store$.dispatch(new StudyStoreActions.GetStudyCountsRequest());

    const searchParams = this.getSearchParams();
    this.store$.dispatch(new StudyStoreActions.SearchStudiesRequest({ searchParams }));

    this.counts$ = this.store$.pipe(select(StudyStoreSelectors.selectStudyCounts));
    this.isLoading$ = this.store$.pipe(select(StudyStoreSelectors.selectStudyIsSearching));

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectSearchResultsAndStudies),
        filter(results => results !== null),
        takeUntil(this.unsubscribe$))
      .subscribe((results: any) => {
        if (results.length > 0) {
          this.results = results[0];
          this.hasResultsToDisplay = this.results.studies.length > 0;
          this.studies = this.results.studies;
          this.currentPage = this.results.page;
        }
      });

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectStudyError),
        filter(err => err !== null),
        takeUntil(this.unsubscribe$))
      .subscribe(err => {
        console.log(err);
      });
  }

  onFiltersUpdated($event: SearchFilters) {
    console.log($event);
    this.filters.nameFilter.setValue($event.name)
    this.filters.stateFilter.setValue($event.stateId)
  }

  sortFieldSelected(sortChoice) {
    this.sortField = sortChoice;
  }

  studySelected($event: Study) {
    //  ui-sref="home.admin.studies.study.summary({ studySlug: entity.slug })"
    console.log($event);
  }

  paginationPageChanged($event) {
    const searchParams = this.getSearchParams();
    this.store$.dispatch(new StudyStoreActions.SearchStudiesRequest({ searchParams }));
  }

  private getFilters() {
    return Object.values(this.filters)
      .map(filter => filter.getValue())
      .filter(value => value !== '');
  }

  private getSearchParams(): SearchParams {
    return {
      filter: this.getFilters().join(';'),
      sort: this.sortField,
      page: this.currentPage,
      limit: 5
    };
  }

  private getItemIcon(study) {
    if (study.isDisabled()) {
      return this.faCog;
    }
    if (study.isEnabled()) {
      return this.faCheckCircle;
    }
    if (study.isRetired()) {
      return this.faMinusCircle;
    }
    throw new Error('invalid study state: ' + study.state);
  }

}
