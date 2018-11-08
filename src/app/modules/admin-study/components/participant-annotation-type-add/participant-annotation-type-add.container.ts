import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject, BehaviorSubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-participant-annotation-type-add',
  templateUrl: './participant-annotation-type-add.container.html'
})
export class ParticipantAnnotationTypeAddContainer implements OnInit, OnDestroy {

  annotationType: AnnotationType;
  isSaving$ = new BehaviorSubject<boolean>(false);

  private study: Study;
  private annotationTypeToSave: AnnotationType;
  private savedMessage: string;
  private unsubscribe$: Subject<void> = new Subject<void>();
  private parentStateRelativePath = '..';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store$: Store<RootStoreState.State>,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.study = this.route.parent.parent.snapshot.data.study;
    this.annotationType = this.study.annotationTypes
      .find(at => at.id == this.route.snapshot.params.annotationTypeId);
    if (!this.annotationType) {
      this.annotationType = new AnnotationType();
    }

    this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudyEntities),
      filter((entities: { [key: string]: any }) => Object.keys(entities).length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: { [key: string]: any }) => {
        const entity = entities[this.study.id];

        this.study = (entity instanceof Study) ? entity : new Study().deserialize(entity);

        if (this.savedMessage) {
          this.isSaving$.next(false);
          this.toastr.success(this.savedMessage, 'Update Successfull');
          this.router.navigate([ '..' ], { relativeTo: this.route });
        }
      });

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectStudyError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        this.isSaving$.next(false);

        let errMessage = error.payload.error
          ? error.payload.error.error.message : error.payload.error.statusText;
        if (errMessage.match(/EntityCriteriaError.*name already used/)) {
          errMessage = `The name is already in use: ${this.annotationTypeToSave.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
        this.savedMessage = undefined;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(annotationType: AnnotationType): void {
    this.isSaving$.next(true);
    this.annotationTypeToSave = annotationType;
    this.store$.dispatch(new StudyStoreActions.UpdateStudyAddOrUpdateAnnotationTypeRequest({
      study: this.study,
      annotationType: this.annotationTypeToSave
    }));

    this.savedMessage = this.annotationType.isNew() ? 'Annotation Added' : 'Annotation Updated'
  }

  onCancel(): void {
    this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
  }

}
