import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Study, StudyStateUIMap } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modal-input/models';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-study-summary',
  templateUrl: './study-summary.component.html',
  styleUrls: ['./study-summary.component.scss']
})
export class StudySummaryComponent implements OnInit, OnDestroy {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;

  private studyId: string;
  private unsubscribe$: Subject<void> = new Subject<void>();
  isLoading$: Observable<boolean>;
  isEnableAllowed: boolean;
  private study: StudyUI;
  studyStateUIMap = StudyStateUIMap;
  descriptionToggleLength = 80;
  getStateIcon = StudyUI.getStateIcon;
  getStateIconClass = StudyUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;
  private updatedMessage: string;

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: NgbModal,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) {}

  ngOnInit() {
    this.studyId = this.route.parent.snapshot.data.study.id;

    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.store$.pipe(
      select(StudyStoreSelectors.selectStudyEnableAllowedIds),
      filter((ids: string[]) => ids.length > 0))
      .subscribe((enableAllowedIds: string[]) => {
        this.isEnableAllowed = enableAllowedIds.includes(this.studyId);
      });

    // when study name is changed, the route must be updated because the slug used in the route,
    // and the slug is derived from the name
    this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudyEntities),
      filter((entities: { [key: string]: any }) => Object.keys(entities).length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: any) => {
        const entity = entities[this.studyId];

        if (!location.pathname.includes(entity.slug)) {
          this.router.navigate([ '../..', entity.slug, 'summary' ], { relativeTo: this.route });
        } else {
          const updatedStudy = (entity instanceof Study) ? entity : new Study().deserialize(entity);
          this.study = new StudyUI(updatedStudy);
        }

        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage,'Update Successfull');
        }
      });

    this.store$.dispatch(new StudyStoreActions.GetEnableAllowedRequest({ studyId: this.studyId}));
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
        if (value.value) {
          this.store$.dispatch(new StudyStoreActions.UpdateStudyRequest({
            study: this.study.entity,
            attributeName: 'name',
            value: value.value
          }));
          this.updatedMessage = 'Study name was updated';
        }
      })
      .catch(err => console.log('err', err));
  }

  updateDescription() {
    this.updateDescriptionModalOptions = {
      required: true,
      rows: 20,
      cols: 10
    };
    this.modalService.open(this.updateDescriptionModal, { size: 'lg' }).result
      .then(value => {
        if (value.value) {
          this.store$.dispatch(new StudyStoreActions.UpdateStudyRequest({
            study: this.study.entity,
            attributeName: 'description',
            value: value.value
          }));
          this.updatedMessage = 'Study description was updated';
        }
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

  private changeState(action) {
    this.store$.dispatch(new StudyStoreActions.UpdateStudyRequest({
      study: this.study.entity,
      attributeName: 'state',
      value: action
    }));
    this.updatedMessage = 'Study state was updated';
  }

}
