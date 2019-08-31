import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { filter, takeUntil, map, withLatestFrom, tap, shareReplay } from 'rxjs/operators';

interface StoreData {
  study: Study;
  annotationType: AnnotationType;
}

@Component({
  selector: 'app-participant-annotation-type-add',
  templateUrl: './participant-annotation-type-add.container.html'
})
export class ParticipantAnnotationTypeAddContainerComponent implements OnInit, OnDestroy {
  data$: Observable<StoreData>;
  annotationType$: Observable<AnnotationType>;
  isSaving$ = new BehaviorSubject<boolean>(false);
  study: Study;
  updatedMessage$ = new Subject<string>();

  private annotationType: AnnotationType;
  private annotationTypeToSave: AnnotationType;
  private parentStateRelativePath = '..';
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store$: Store<RootStoreState.State>,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.data$ = this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudies),
      map((studies: Study[]) => {
        const studyEntity = studies.find(s => s.slug === this.route.parent.parent.snapshot.params.slug);

        if (!studyEntity) {
          throw new Error('study not found');
        }

        const study = studyEntity instanceof Study ? studyEntity : new Study().deserialize(studyEntity);

        const annotationType = study.annotationTypes.find(
          at => at.id === this.route.snapshot.params.annotationTypeId
        );
        return {
          study,
          annotationType: annotationType ? annotationType : new AnnotationType()
        };
      }),
      tap(data => {
        this.study = data.study;
        this.annotationType = data.annotationType;
      }),
      shareReplay()
    );

    this.annotationType$ = this.data$.pipe(map(data => data.annotationType));

    this.data$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([_data, msg]) => {
        this.isSaving$.next(false);
        this.toastr.success(msg, 'Update Successfull');
        this.router.navigate([this.parentStateRelativePath], { relativeTo: this.route });
      });

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectStudyError),
        filter(s => !!s),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        this.isSaving$.next(false);

        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage && errMessage.match(/EntityCriteriaError.*name already used/)) {
          errMessage = `The name is already in use: ${this.annotationTypeToSave.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(annotationType: AnnotationType): void {
    this.isSaving$.next(true);
    this.annotationTypeToSave = annotationType;
    this.store$.dispatch(
      StudyStoreActions.updateStudyAddOrUpdateAnnotationTypeRequest({
        study: this.study,
        annotationType: this.annotationTypeToSave
      })
    );

    this.updatedMessage$.next(this.annotationType.isNew() ? 'Annotation Added' : 'Annotation Updated');
  }

  onCancel(): void {
    this.router.navigate([this.parentStateRelativePath], { relativeTo: this.route });
  }
}
