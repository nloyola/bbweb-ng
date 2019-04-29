import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { filter, map, takeUntil, withLatestFrom, shareReplay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-study-participants',
  templateUrl: './study-participants.component.html',
  styleUrls: ['./study-participants.component.scss']
})
export class StudyParticipantsComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  study$: Observable<Study>;
  study: StudyUI;
  isAddingAnnotation = false;
  sortedAnnotationTypes: AnnotationType[];
  updatedMessage$ = new Subject<string>();

  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.study$ = this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudies),
      filter(s => s.length > 0),
      map((studies: Study[]) => {
        const studyEntity = studies.find(s => s.slug === this.route.parent.parent.snapshot.params.slug);
        if (studyEntity) {
          return (studyEntity instanceof Study) ? studyEntity :  new Study().deserialize(studyEntity);
        }
        return undefined;
      }),
      tap(study => {
        this.study = new StudyUI(study);
        this.setAnnotations();
      }),
      shareReplay());

    this.store$.pipe(
      select(StudyStoreSelectors.selectStudyError),
      filter(error => !!error),
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([error, _msg]) => {
      const errMessage = error.error.error ? error.error.error.message : error.error.statusText;
      this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
    });

    this.study$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ _study, msg ]) => {
      this.toastr.success(msg, 'Update Successfull');
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  add() {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ 'add' ], { relativeTo: this.route });
  }

  view(annotationType: AnnotationType) {
    const modalRef = this.modalService.open(AnnotationTypeViewComponent, { size: 'lg' });
    modalRef.componentInstance.annotationType = annotationType;
    // nothing is done with this modal's result
  }

  edit(annotationType: AnnotationType) {
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
        this.store$.dispatch(StudyStoreActions.updateStudyRemoveAnnotationTypeRequest({
          study: this.study.entity,
          annotationTypeId: annotationType.id
        }));
        this.updatedMessage$.next('Annotation removed');
      })
      .catch(() => undefined);
  }

  private setAnnotations() {
    this.sortedAnnotationTypes = AnnotationType.sortAnnotationTypes(this.study.annotationTypes);
  }

}
