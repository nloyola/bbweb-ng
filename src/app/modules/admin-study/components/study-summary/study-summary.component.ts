import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Study, StudyStateUIMap } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modal-input/models';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { EnableAllowdIds } from '@app/root-store/study/study.reducer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Dictionary } from '@ngrx/entity';

@Component({
  selector: 'app-study-summary',
  templateUrl: './study-summary.component.html',
  styleUrls: ['./study-summary.component.scss']
})
export class StudySummaryComponent implements OnInit, OnDestroy {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  isEnableAllowed: boolean;
  studyStateUIMap = StudyStateUIMap;
  descriptionToggleLength = 80;
  getStateIcon = StudyUI.getStateIcon;
  getStateIconClass = StudyUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;

  private studyId: string;
  private study: StudyUI;
  private updatedMessage: string;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: NgbModal,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) {}

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.store$.pipe(
      select(StudyStoreSelectors.selectStudyEnableAllowedIds),
      takeUntil(this.unsubscribe$))
      .subscribe((enableAllowedIds: EnableAllowdIds) => {
        if (this.studyId === undefined) { return; }
        this.isEnableAllowed = (enableAllowedIds[this.studyId] === true);
      });

    this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudies),
      filter(s => s.length > 0),
      map((studies: Study[]) => studies.find(s => s.slug === this.route.parent.snapshot.params.slug)),
      filter(study => study !== undefined),
      map(study => (study instanceof Study) ? study :  new Study().deserialize(study)),
      takeUntil(this.unsubscribe$))
      .subscribe(study => {
        this.study = new StudyUI(study);
        this.studyId = study.id;
        this.store$.dispatch(new StudyStoreActions.GetEnableAllowedRequest({ studyId: study.id }));
      });

    this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudyEntities),
      filter((entities: Dictionary<Study>) => Object.keys(entities).length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: any) => {
        if (this.studyId === undefined) { return; }

        const entity = entities[this.studyId];
        const updatedStudy = (entity instanceof Study) ? entity : new Study().deserialize(entity);
        this.study = new StudyUI(updatedStudy);

        // when study name is changed, the route must be updated because the slug used in the route,
        // and the slug is derived from the name
        if (this.studyId && !location.pathname.endsWith(`/${entity.slug}`)) {
          this.router.navigate([ '../..', entity.slug, 'summary' ], { relativeTo: this.route });
        }

        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage, 'Update Successfull');
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
      rows: 20,
      cols: 10
    };
    this.modalService.open(this.updateDescriptionModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new StudyStoreActions.UpdateStudyRequest({
          study: this.study.entity,
          attributeName: 'description',
          value: value.value ? value.value : undefined
        }));
        this.updatedMessage = 'Study description was updated';
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

  private changeState(action: string) {
    this.store$.dispatch(new StudyStoreActions.UpdateStudyRequest({
      study: this.study.entity,
      attributeName: 'state',
      value: action
    }));
    this.updatedMessage = 'Study state was updated';
  }

}
