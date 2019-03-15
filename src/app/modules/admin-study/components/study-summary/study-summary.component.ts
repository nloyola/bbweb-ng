import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Study, StudyStateUIMap } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { EnableAllowdIds } from '@app/root-store/study/study.reducer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, tap, withLatestFrom, share } from 'rxjs/operators';

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

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  study$: Observable<StudyUI>;
  isEnableAllowed: boolean;
  studyStateUIMap = StudyStateUIMap;
  descriptionToggleLength = 80;
  getStateIcon = StudyUI.getStateIcon;
  getStateIconClass = StudyUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;

  private data$: Observable<StoreData>;
  private studyId: string;
  private study: StudyUI;
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: NgbModal,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    const selector = createSelector(
      StudyStoreSelectors.selectAllStudies,
      StudyStoreSelectors.selectStudyEnableAllowedIds,
      (studies: Study[], enableAllowedIds: EnableAllowdIds) =>
        ({ studies, enableAllowedIds }));

    this.data$ = this.store$.pipe(
      select(selector),
      map(data => {
        const studyEntity = data.studies.find(s => s.slug === this.route.parent.snapshot.params.slug);
        if (studyEntity) {
          const study = this.studyEntityToUI(studyEntity);
          const isEnableAllowed = data.enableAllowedIds[this.studyId];
          return { study, isEnableAllowed };
        }

        if (this.studyId) {
          const studyById = data.studies.find(s => s.id === this.studyId);
          if (!studyById) {
            throw new Error('could not find study by ID');
          }
          const study = this.studyEntityToUI(studyById);
          const isEnableAllowed = data.enableAllowedIds[this.studyId];
          return { study, isEnableAllowed };
        }

        return undefined;
      }),
      tap(data => {
        if (data === undefined) { return; }

        if (this.studyId === undefined) {
          this.studyId = data.study.id;
          this.store$.dispatch(new StudyStoreActions.GetEnableAllowedRequest({ studyId: data.study.id }));
        }

        this.study = data.study;
        this.isEnableAllowed = data.isEnableAllowed;
      }),
      share());

    this.study$ = this.data$.pipe(map(data => data ? data.study : undefined));

    this.data$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ data, msg ]) => {
      if (data === undefined) { return; }

      this.toastr.success(msg, 'Update Successfull');

      if (data.study.slug !== this.route.parent.snapshot.params.slug) {
        // name was changed and new slug was assigned
        //
        // need to change state since slug is used in URL and by breadcrumbs
        this.router.navigate([ '../..', data.study.slug, 'summary' ], { relativeTo: this.route });
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName() {
    this.updateNameModalOptions = {
      required: true,
      minLength: 2
    };
    this.modalService.open(this.updateNameModal).result
      .then(value => {
        this.store$.dispatch(new StudyStoreActions.UpdateStudyRequest({
          study: this.study.entity,
          attributeName: 'name',
          value
        }));
        this.updatedMessage$.next('Study name was updated');
      })
      .catch(err => console.log('err', err));
  }

  updateDescription() {
    this.updateDescriptionModalOptions = {
      rows: 20,
      cols: 10
    };
    this.modalService.open(this.updateDescriptionModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new StudyStoreActions.UpdateStudyRequest({
          study: this.study.entity,
          attributeName: 'description',
          value: value ? value : undefined
        }));
        this.updatedMessage$.next('Study description was updated');
      })
      .catch(err => console.log('err', err));
  }

  disable() {
    this.changeState('disable');
  }

  enable() {
    this.changeState('enable');
  }

  retire() {
    this.changeState('retire');
  }

  unretire() {
    this.changeState('unretire');
  }

  private changeState(action: 'disable' | 'enable' | 'retire' | 'unretire') {
    this.store$.dispatch(new StudyStoreActions.UpdateStudyRequest({
      study: this.study.entity,
      attributeName: 'state',
      value: action
    }));
    this.updatedMessage$.next('Study state was updated');
  }

  private studyEntityToUI(entity: any): StudyUI {
    const study = (entity instanceof Study) ? entity : new Study().deserialize(entity);
    return new StudyUI(study);
  }

}
