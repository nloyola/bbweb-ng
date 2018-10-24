import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { Study } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-study-participants',
  templateUrl: './study-participants.component.html',
  styleUrls: ['./study-participants.component.scss']
})
export class StudyParticipantsComponent implements OnInit {

  isLoading$: Observable<boolean>;
  isAddingAnnotation = false;
  sortedAnnotationTypes: AnnotationType[];

  private study: StudyUI;
  private updatedMessage: string;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.study = new StudyUI(this.route.parent.parent.snapshot.data.study);
    this.setAnnotations();

    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudyEntities),
      filter((entities: { [key: string]: any }) => Object.keys(entities).length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: any) => {
        const entity = entities[this.study.id];

        const updatedStudy = (entity instanceof Study)
          ? entity : new Study().deserialize(entity);
        this.study = new StudyUI(updatedStudy);
        this.setAnnotations();

        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage, 'Update Successfull');
        }
      });

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectStudyError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        let errMessage = error.payload.error
          ? error.payload.error.error.message : error.payload.error.statusText;
        this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
      });

    this.store$.dispatch(new StudyStoreActions.GetEnableAllowedRequest({ studyId: this.study.id}));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  add() {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    console.log('navigate to add', this.route);
    this.router.navigate([ 'add' ], { relativeTo: this.route });
  }

  view(annotationType: AnnotationType) {
    const modalRef = this.modalService.open(AnnotationTypeViewComponent, { size: 'lg' });
    modalRef.componentInstance.annotationType = annotationType;

    // nothing is done with this modal's result
    modalRef.result
      .then(() => undefined)
      .catch(() => undefined);
  }

  edit(annotationType: AnnotationType) {
    console.log('navigate to edit');

    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ `../${annotationType.id}` ], { relativeTo: this.route });
  }

  remove(annotationType: AnnotationType) {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(AnnotationTypeRemoveComponent);
    modalRef.componentInstance.annotationType = annotationType;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new StudyStoreActions.UpdateStudyRemoveAnnotationTypeRequest({
          study: this.study.entity,
          annotationTypeId: annotationType.id
        }));

        this.updatedMessage = 'Annotation removed';
      })
      .catch(() => undefined);
  }

  private setAnnotations() {
    this.sortedAnnotationTypes = AnnotationType.sortAnnotationTypes(this.study.annotationTypes);
  }

}
