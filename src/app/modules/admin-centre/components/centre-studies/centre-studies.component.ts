import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityNameAndState, SearchParams } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { StudyState, StudyStateUIMap, Study } from '@app/domain/studies';
import { ModalInputResult } from '@app/modules/modal-input/models';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { NgbModal, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil, switchMap, catchError, tap } from 'rxjs/operators';
import { StudyRemoveComponent } from '../study-remove/study-remove.component';
import { StudyService } from '@app/core/services';

@Component({
  selector: 'app-centre-studies',
  templateUrl: './centre-studies.component.html',
  styleUrls: ['./centre-studies.component.scss']
})
export class CentreStudiesComponent implements OnInit, OnDestroy {

  centre: CentreUI;
  updatedMessage: string;
  selectedStudy: Study;
  getStudyNames: (text: Observable<string>) => Observable<any[]>;
  typeaheadFormatter: (value: any) => string;
  sortedStudyNames: EntityNameAndState<StudyState>[];

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {
    this.typeaheadFormatter = (study) => study.name;

    this.getStudyNames = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        filter(term => term.length > 0),
        switchMap(term => {
          const searchParams = new SearchParams(`name:like:${term}`);
          this.store$.dispatch(new StudyStoreActions.SearchStudiesRequest({ searchParams }));
          return this.store$.pipe(
            select(StudyStoreSelectors.selectStudySearchRepliesAndEntities),
            filter(x => !!x),
            map(x => x.studies));
        }));
  }

  ngOnInit() {
    this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => centres.find(s => s.slug === this.route.parent.snapshot.params.slug)),
      filter(centre => centre !== undefined),
      map(centre => (centre instanceof Centre) ? centre :  new Centre().deserialize(centre)),
      takeUntil(this.unsubscribe$))
      .subscribe(centre => {
        this.centre = new CentreUI(centre);
        this.sortedStudyNames = this.sortStudyNames(centre.studyNames);

        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage, 'Update Successfull');
          this.updatedMessage = undefined;
        }
      });

    this.store$
      .pipe(
        select(CentreStoreSelectors.selectCentreError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        const errMessage = error.error ? error.error.message : error.statusText;
        this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  studyStateLabel(study: EntityNameAndState<StudyState>) {
    return StudyStateUIMap.get(study.state).stateLabel;
  }

  selectedItem(item: NgbTypeaheadSelectItemEvent): void {
    this.store$.dispatch(new CentreStoreActions.UpdateCentreAddStudyRequest({
      centre: this.centre.entity,
      studyId: item.item.id
    }));

    this.updatedMessage = 'Study added';
  }

  remove(study: EntityNameAndState<StudyState>) {
    const modalRef = this.modalService.open(StudyRemoveComponent);
    modalRef.componentInstance.study = study;
    modalRef.result
      .then((result: ModalInputResult) => {
        if (result.confirmed) {
          this.store$.dispatch(new CentreStoreActions.UpdateCentreRemoveStudyRequest({
            centre: this.centre.entity,
            studyId: study.id
          }));

          this.updatedMessage = 'Study removed';
        }
      })
      .catch(err => console.log('err', err));
  }

  private sortStudyNames(studyNames: EntityNameAndState<StudyState>[]): EntityNameAndState<StudyState>[] {
    const sortedStudyNames = studyNames.slice(0);
    sortedStudyNames
      .sort((a: EntityNameAndState<StudyState>, b: EntityNameAndState<StudyState>): number => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
    return sortedStudyNames;
  }

}
