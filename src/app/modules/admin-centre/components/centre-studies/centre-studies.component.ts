import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Centre } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { Study, StudyStateUIMap, StudyStateInfo } from '@app/domain/studies';
import { StudyRemoveModalComponent } from '@app/modules/modals/components/study-remove-modal/study-remove-modal.component';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { StudyAddTypeahead } from '@app/shared/typeaheads/study-add-typeahead';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { Dictionary } from '@ngrx/entity';

@Component({
  selector: 'app-centre-studies',
  templateUrl: './centre-studies.component.html',
  styleUrls: ['./centre-studies.component.scss']
})
export class CentreStudiesComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  centre$: Observable<CentreUI>;
  updatedMessage: string;
  selectedStudy: Study;
  getStudyNames: (text: Observable<string>) => Observable<any[]>;
  typeaheadFormatter: (value: any) => string;
  sortedStudyNames: StudyStateInfo[];
  studyAddTypeahead: StudyAddTypeahead;

  private centreSubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {
    this.studyAddTypeahead = new StudyAddTypeahead(
      this.store$,
      (studies: Study[]) => {
        // filter out studies already linked to this centre
        const existingStudyIds = this.sortedStudyNames.map(sn => sn.id);
        return studies.filter(entity => existingStudyIds.indexOf(entity.id) < 0);
      });

    this.studyAddTypeahead.selected$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((study: Study) => {
      const centre = this.centreSubject.value.entity;
      this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
        centre,
        attributeName: 'studyAdd',
        value: study.id
      }));

      this.updatedMessage$.next('Study added');
    });
  }

  ngOnInit() {
    this.centre$ = this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentreEntities),
      map((centres: Dictionary<Centre>) => {
        const centreEntity = centres[this.route.parent.snapshot.data.centre.id];
        if (centreEntity) {
          const centre = (centreEntity instanceof Centre)
            ? centreEntity :  new Centre().deserialize(centreEntity);
          return new CentreUI(centre);
        }
        return undefined;
      }),
      tap(centre => {
        if (centre) {
          this.sortedStudyNames = this.sortStudyNames(centre.entity.studyNames);
        }
      }),
      shareReplay());

    this.centre$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.centreSubject);
    this.isLoading$ = this.centre$.pipe(map(centre => centre === undefined));

    this.store$.pipe(
      select(CentreStoreSelectors.selectCentreError),
      filter(error => !!error),
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ error, _msg ]) => {
      const errMessage = error.error.error ? error.error.error.message : error.error.statusText;
      this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
    });

    this.centre$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ centre, msg ]) => {
      this.toastr.success(msg, 'Update Successfull');
      this.studyAddTypeahead.clearSelected();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  studyStateLabel(study: StudyStateInfo) {
    return StudyStateUIMap.get(study.state).stateLabel;
  }

  remove(study: StudyStateInfo) {
    this.whenCentreDisabled(centre => {
      const modalRef = this.modalService.open(StudyRemoveModalComponent);
      modalRef.componentInstance.study = study;
      modalRef.result
        .then(() => {
          this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
            centre,
            attributeName: 'studyRemove',
            value: study.id
          }));

          this.updatedMessage$.next('Study removed');
        })
        .catch(() => undefined);
    });
  }

  private sortStudyNames(studyNames: StudyStateInfo[]): StudyStateInfo[] {
    const sortedStudyNames = studyNames.slice(0);
    sortedStudyNames
      .sort((a: StudyStateInfo, b: StudyStateInfo): number => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
    return sortedStudyNames;
  }

  private whenCentreDisabled(fn: (centre: Centre) => void) {
    const centre = this.centreSubject.value.entity;
    if (!centre.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    fn(centre);
  }

}
