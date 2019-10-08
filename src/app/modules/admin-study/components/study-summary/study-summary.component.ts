import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Study, StudyStateUIMap, StudyState } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { EnableAllowdIds } from '@app/root-store/study/study.reducer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom, tap } from 'rxjs/operators';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

interface StoreData {
  study: Study;
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
  isEnableAllowed$: Observable<boolean>;
  studyStateUIMap = StudyStateUIMap;
  descriptionToggleLength = 80;
  updateNameModalOptions: ModalInputTextOptions = {
    required: true,
    minLength: 2
  };
  updateDescriptionModalOptions: ModalInputTextareaOptions = {
    rows: 20,
    cols: 10
  };
  menuItems: DropdownMenuItem[];

  private data$: Observable<StoreData>;
  private studyId: string;
  private dataSubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

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
          study: study ? (study instanceof Study ? study : new Study().deserialize(study)) : undefined,
          isEnableAllowed
        };
      }
    );

    this.data$ = this.store$.pipe(
      select(selector),
      filter(data => data !== undefined && data.study !== undefined && data.isEnableAllowed !== undefined),
      tap(data => {
        this.menuItems = this.createMenuItems(data);
      }),
      shareReplay()
    );

    this.data$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.dataSubject);
    this.study$ = this.data$.pipe(map(data => new StudyUI(data.study)));
    this.isEnableAllowed$ = this.data$.pipe(map(data => data.isEnableAllowed));
    this.isLoading$ = this.data$.pipe(map(data => data === undefined || data.study === undefined));

    this.data$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([data, msg]) => {
        if (data === undefined || msg === null) {
          return;
        }

        this.toastr.success(msg, 'Update Successfull');
        this.updatedMessage$.next(null);

        if (data.study.slug !== this.route.parent.snapshot.params.slug) {
          // name was changed and new slug was assigned
          //
          // need to change state since slug is used in URL and by breadcrumbs
          this.router.navigate(['../..', data.study.slug, 'summary'], { relativeTo: this.route });
        }
      });

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectStudyError),
        filter(error => !!error),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
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
    this.whenStudyDisabled(study => {
      this.modalService
        .open(this.updateNameModal, { size: 'lg' })
        .result.then(value => {
          this.store$.dispatch(
            StudyStoreActions.updateStudyRequest({
              study,
              attributeName: 'name',
              value
            })
          );
          this.updatedMessage$.next('Study name was updated');
        })
        .catch(() => undefined);
    });
  }

  updateDescription() {
    this.whenStudyDisabled(study => {
      this.modalService
        .open(this.updateDescriptionModal, { size: 'lg' })
        .result.then(value => {
          this.store$.dispatch(
            StudyStoreActions.updateStudyRequest({
              study,
              attributeName: 'description',
              value: value ? value : undefined
            })
          );
          this.updatedMessage$.next('Study description was updated');
        })
        .catch(() => undefined);
    });
  }

  disable() {
    this.changeState('disable');
  }

  enable() {
    const storeData = this.dataSubject.value;
    if (storeData && !storeData.isEnableAllowed) {
      throw new Error('not allowed to enable study');
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
    const storeData = this.dataSubject.value;
    if (!storeData) {
      return;
    }
    this.store$.dispatch(
      StudyStoreActions.updateStudyRequest({
        study: storeData.study,
        attributeName: 'state',
        value: action
      })
    );
    this.updatedMessage$.next('Study state was updated');
  }

  private whenStudyDisabled(fn: (study: Study) => void) {
    const storeData = this.dataSubject.value;
    if (!storeData) {
      return;
    }
    if (!storeData.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    fn(storeData.study);
  }

  private createMenuItems(storeData: StoreData): DropdownMenuItem[] {
    if (!storeData || !storeData.study) {
      throw new Error('study is undefined');
    }

    const study = storeData.study;
    const items: DropdownMenuItem[] = [];

    if (study.isDisabled()) {
      items.push(
        {
          kind: 'selectable',
          label: 'Update Name',
          icon: 'edit',
          iconClass: 'success-icon',
          onSelected: () => {
            this.updateName();
          }
        },
        {
          kind: 'selectable',
          label: 'Update Description',
          icon: 'edit',
          iconClass: 'success-icon',
          onSelected: () => {
            this.updateDescription();
          }
        }
      );
    }

    if (study.isEnabled()) {
      items.push({
        kind: 'selectable',
        label: 'Disable this Study',
        icon: StudyUI.getStateIcon(StudyState.Disabled),
        iconClass: StudyUI.getStateIconClass(StudyState.Disabled),
        onSelected: () => {
          this.disable();
        }
      });
    }

    if (study.isDisabled() && storeData.isEnableAllowed) {
      items.push({
        kind: 'selectable',
        label: 'Enable this Study',
        icon: StudyUI.getStateIcon(StudyState.Enabled),
        iconClass: StudyUI.getStateIconClass(StudyState.Enabled),
        onSelected: () => {
          this.enable();
        }
      });
    }

    if (study.isDisabled()) {
      items.push({
        kind: 'selectable',
        label: 'Retire this Study',
        icon: StudyUI.getStateIcon(StudyState.Retired),
        iconClass: StudyUI.getStateIconClass(StudyState.Retired),
        onSelected: () => {
          this.retire();
        }
      });
    }

    if (study.isRetired()) {
      items.push({
        kind: 'selectable',
        label: 'Unretire this Study',
        icon: StudyUI.getStateIcon(StudyState.Disabled),
        iconClass: StudyUI.getStateIconClass(StudyState.Disabled),
        onSelected: () => {
          this.unretire();
        }
      });
    }
    return items;
  }
}
