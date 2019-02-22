import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityNameAndState, SearchParams } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { Study, StudyState, StudyStateUIMap } from '@app/domain/studies';
import { ModalInputResult } from '@app/modules/modal-input/models';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { NgbModal, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { StudyRemoveComponent } from '../study-remove/study-remove.component';
import { StudyAddTypeahead } from '@app/shared/typeaheads/study-add-typeahead';

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
  studyAddTypeahead: StudyAddTypeahead;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {
    this.studyAddTypeahead = new StudyAddTypeahead(
      this.store$,
      (studies: Study[]) => {
        // filter out studys already linked to this membership
        const existingStudyIds = this.centre.entity.studyNames.map(sn => sn.id);
        return studies.filter(entity => existingStudyIds.indexOf(entity.id) < 0);
      });

    this.studyAddTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((study: Study) => {
      this.store$.dispatch(new CentreStoreActions.UpdateCentreAddStudyRequest({
        centre: this.centre.entity,
        studyId: study.id
      }));

      this.updatedMessage = 'Study added';
    });
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
          this.studyAddTypeahead.clearSelected();
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
