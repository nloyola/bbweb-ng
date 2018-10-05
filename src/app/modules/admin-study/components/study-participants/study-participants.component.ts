import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { ToastrService } from 'ngx-toastr';
import { select, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { Subject, Observable } from 'rxjs';
import { Study } from '@app/domain/studies';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';

@Component({
  selector: 'app-study-participants',
  templateUrl: './study-participants.component.html',
  styleUrls: ['./study-participants.component.scss']
})
export class StudyParticipantsComponent implements OnInit {

  isLoading$: Observable<boolean>;

  private studyId: string;
  private study: StudyUI;
  private updatedMessage: string;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.studyId = this.route.parent.snapshot.data.study.id;

    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    // and the slug is derived from the name
    this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudyEntities),
      filter((entities: { [key: string]: any }) => Object.keys(entities).length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: any) => {
        const entity = entities[this.studyId];

        const updatedStudy = (entity instanceof Study) ? entity : new Study().deserialize(entity);
        this.study = new StudyUI(updatedStudy);

        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage, 'Update Successfull');
        }
      });

    this.store$.dispatch(new StudyStoreActions.GetEnableAllowedRequest({ studyId: this.studyId}));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  add() {
    this.router.navigate([ 'participants', 'add' ], { relativeTo: this.route });
  }

  view(annotationType) {
    this.router.navigate([ 'participants', annotationType.slug ], { relativeTo: this.route });
  }

  remove(annotationType) {
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

}
