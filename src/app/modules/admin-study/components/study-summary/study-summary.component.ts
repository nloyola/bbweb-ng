import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Study, StudyStateUIMap } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { EnableAllowdIds } from '@app/root-store/study/study.reducer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom } from 'rxjs/operators';

interface StoreData {
  study: StudyUI;
  isEnableAllowed: boolean;
}

@Component({
  selector: 'app-study-summary',
  templateUrl: './study-summary.component.html',
  styleUrls: ['./study-summary.component.scss']
})
export class StudySummaryComponent implements OnInit, OnDestroy {

  @ViewChild('updateNameModal', { static: false }) updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal', { static: false }) updateDescriptionModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  study$: Observable<StudyUI>;
  studyStateUIMap = StudyStateUIMap;
  descriptionToggleLength = 80;
  getStateIcon = StudyUI.getStateIcon;
  getStateIconClass = StudyUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions = {
    required: true,
    minLength: 2
  };
  updateDescriptionModalOptions: ModalInputTextareaOptions = {
    rows: 20,
    cols: 10
  };

  private data$: Observable<StoreData>;
  private studyId: string;
  private studySubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: NgbModal,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.studyId = this.route.parent.snapshot.data.study.id;
    this.store$.dispatch(StudyStoreActions.getEnableAllowedRequest({ studyId: this.studyId }));

    const selector = createSelector(
      StudyStoreSelectors.selectAllStudyEntities,
      StudyStoreSelectors.selectStudyEnableAllowedIds,
      (studies: Dictionary<Study>, enableAllowedIds: EnableAllowdIds) => {
        const study = studies[this.studyId];
        const isEnableAllowed = enableAllowedIds[this.studyId];
        return {
          study : study ? this.studyEntityToUI(study) : undefined,
          isEnableAllowed
        };
      });

    this.data$ = this.store$.pipe(
      select(selector),
      shareReplay());

    this.data$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.studySubject);

    this.study$ = this.data$.pipe(map(data => data ? data.study : undefined));
    this.isLoading$ = this.data$.pipe(map(data => (data === undefined) || (data.study === undefined)));

    this.data$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ data, msg ]) => {
      if ((data === undefined) || (msg === null)) { return; }

      this.toastr.success(msg, 'Update Successfull');
      this.updatedMessage$.next(null);

      if (data.study.slug !== this.route.parent.snapshot.params.slug) {
        // name was changed and new slug was assigned
        //
        // need to change state since slug is used in URL and by breadcrumbs
        this.router.navigate([ '../..', data.study.slug, 'summary' ], { relativeTo: this.route });
      }
    });

    this.store$.pipe(
      select(StudyStoreSelectors.selectStudyError),
      filter(error => !!error),
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([error, _msg]) => {
      let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
      if (errMessage.indexOf('name already used') > -1) {
        errMessage = 'A study with that name already exists. Please use another name.';
      }
      this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName() {
    this.whenStudyDisabled((study) => {
      this.modalService.open(this.updateNameModal, { size: 'lg' }).result
        .then(value => {
          this.store$.dispatch(StudyStoreActions.updateStudyRequest({
            study,
            attributeName: 'name',
            value
          }));
          this.updatedMessage$.next('Study name was updated');
        })
        .catch(() => undefined);
    });
  }

  updateDescription() {
    this.whenStudyDisabled((study) => {
      this.modalService.open(this.updateDescriptionModal, { size: 'lg' }).result
        .then(value => {
          this.store$.dispatch(StudyStoreActions.updateStudyRequest({
            study,
            attributeName: 'description',
            value: value ? value : undefined
          }));
          this.updatedMessage$.next('Study description was updated');
        })
        .catch(() => undefined);
    });
  }

  disable() {
    this.changeState('disable');
  }

  enable() {
    if (!this.studySubject.value.isEnableAllowed) {
      throw new Error('not allowed to enable study');
      return;
    }
    this.changeState('enable');
  }

  retire() {
    this.changeState('retire');
  }

  unretire() {
    this.changeState('unretire');
  }

  private changeState(action: 'disable' | 'enable' | 'retire' | 'unretire') {
    const study = this.studySubject.value.study.entity;
    this.store$.dispatch(StudyStoreActions.updateStudyRequest({
      study,
      attributeName: 'state',
      value: action
    }));
    this.updatedMessage$.next('Study state was updated');
  }

  private studyEntityToUI(entity: any): StudyUI {
    const study = (entity instanceof Study) ? entity : new Study().deserialize(entity);
    return new StudyUI(study);
  }

  private whenStudyDisabled(fn: (study: Study) => void) {
    const study = this.studySubject.value.study.entity;
    if (!study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    fn(study);
  }

}
