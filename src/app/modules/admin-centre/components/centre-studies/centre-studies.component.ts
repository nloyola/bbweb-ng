import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityInfoAndState } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { Study, StudyState, StudyStateUIMap, IStudyInfoAndState } from '@app/domain/studies';
import { StudyRemoveModalComponent } from '@app/modules/modals/components/study-remove-modal/study-remove-modal.component';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { StudyAddTypeahead } from '@app/shared/typeaheads/study-add-typeahead';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

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
  sortedStudyNames: IStudyInfoAndState[];
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

  studyStateLabel(study: IStudyInfoAndState) {
    return StudyStateUIMap.get(study.state).stateLabel;
  }

  remove(study: IStudyInfoAndState) {
    const modalRef = this.modalService.open(StudyRemoveModalComponent);
    modalRef.componentInstance.study = study;
    modalRef.result
      .then((result) => {
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

  private sortStudyNames(studyNames: IStudyInfoAndState[]): IStudyInfoAndState[] {
    const sortedStudyNames = studyNames.slice(0);
    sortedStudyNames
      .sort((a: IStudyInfoAndState, b: IStudyInfoAndState): number => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
    return sortedStudyNames;
  }

}
