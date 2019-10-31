import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { Study } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-study-participants',
  templateUrl: './study-participants.component.html',
  styleUrls: ['./study-participants.component.scss']
})
export class StudyParticipantsComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  study$: Observable<StudyUI>;
  sortedAnnotationTypes: AnnotationType[];
  menuItems: DropdownMenuItem[];

  private studySubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.menuItems = this.createMenuItems();
  }

  ngOnInit() {
    this.study$ = this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudyEntities),
      map((studies: Dictionary<Study>) => {
        const studyEntity = studies[this.route.parent.parent.snapshot.data.study.id];
        if (studyEntity) {
          const study = studyEntity instanceof Study ? studyEntity : new Study().deserialize(studyEntity);
          return new StudyUI(study);
        }
        return undefined;
      }),
      tap(study => {
        if (study) {
          this.setAnnotations(study.entity);
        }
      }),
      shareReplay()
    );

    this.study$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.studySubject);
    this.isLoading$ = this.study$.pipe(map(study => study === undefined));

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectStudyError),
        filter(error => !!error),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        const errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
      });

    this.study$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([_study, msg]) => {
        this.toastr.success(msg, 'Update Successfull');
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  add() {
    const study = this.studySubject.value.entity;
    if (!study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  view(annotationType: AnnotationType) {
    const modalRef = this.modalService.open(AnnotationTypeViewComponent, { size: 'lg' });
    modalRef.componentInstance.annotationType = annotationType;
    // nothing is done with this modal's result
  }

  edit(annotationType: AnnotationType) {
    const study = this.studySubject.value.entity;
    if (!study.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([`../${annotationType.id}`], { relativeTo: this.route });
  }

  remove(annotationType: AnnotationType) {
    const study = this.studySubject.value.entity;
    if (!study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(AnnotationTypeRemoveComponent);
    modalRef.componentInstance.annotationType = annotationType;
    modalRef.result
      .then(() => {
        this.store$.dispatch(
          StudyStoreActions.updateStudyRemoveAnnotationTypeRequest({
            study,
            annotationTypeId: annotationType.id
          })
        );
        this.updatedMessage$.next('Annotation removed');
      })
      .catch(() => undefined);
  }

  private setAnnotations(study: Study) {
    this.sortedAnnotationTypes = AnnotationType.sortAnnotationTypes(study.annotationTypes);
  }

  private createMenuItems(): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Add Annotation',
        icon: 'edit',
        iconClass: 'add-circle',
        onSelected: () => {
          this.add();
        }
      }
    ];
    return items;
  }
}
