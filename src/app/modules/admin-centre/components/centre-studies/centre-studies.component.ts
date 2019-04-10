import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Centre } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { IStudyInfoAndState, Study, StudyStateUIMap } from '@app/domain/studies';
import { StudyRemoveModalComponent } from '@app/modules/modals/components/study-remove-modal/study-remove-modal.component';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { StudyAddTypeahead } from '@app/shared/typeaheads/study-add-typeahead';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';

@Component({
  selector: 'app-centre-studies',
  templateUrl: './centre-studies.component.html',
  styleUrls: ['./centre-studies.component.scss']
})
export class CentreStudiesComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  centre$: Observable<CentreUI>;
  centre: CentreUI;
  updatedMessage: string;
  selectedStudy: Study;
  getStudyNames: (text: Observable<string>) => Observable<any[]>;
  typeaheadFormatter: (value: any) => string;
  sortedStudyNames: IStudyInfoAndState[];
  studyAddTypeahead: StudyAddTypeahead;

  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

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

    this.studyAddTypeahead.selected$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((study: Study) => {
      this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
        centre: this.centre.entity,
        attributeName: 'studyAdd',
        value: study.id
      }));

      this.updatedMessage$.next('Study added');
    });
  }

  ngOnInit() {
    this.store$.dispatch(new CentreStoreActions.GetCentreRequest({
      slug: this.route.parent.snapshot.params.slug
    }));
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.centre$ = this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => {
        const centreEntity = centres.find(s => s.slug === this.route.parent.snapshot.params.slug);
        if (centreEntity) {
          const centre = (centreEntity instanceof Centre)
            ? centreEntity :  new Centre().deserialize(centreEntity);
          return new CentreUI(centre);
        }
        return undefined;
      }),
      tap(centre => {
        this.centre = centre;
        if (centre) {
          this.sortedStudyNames = this.sortStudyNames(centre.entity.studyNames);
        }
      }),
      shareReplay());

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
      .then(() => {
        this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
          centre: this.centre.entity,
          attributeName: 'studyRemove',
          value: study.id
        }));

        this.updatedMessage$.next('Study removed');
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
