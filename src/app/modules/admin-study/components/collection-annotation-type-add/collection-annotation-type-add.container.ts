import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-collection-annotation-type-add',
  templateUrl: './collection-annotation-type-add.container.html'
})
export class CollectionAnnotationTypeAddContainer implements OnInit, OnDestroy {

  annotationType: AnnotationType;
  isLoading$: Observable<boolean>;
  isSaving$ = new BehaviorSubject<boolean>(false);

  private study: Study;
  private eventTypeSlug: string;
  private eventType: CollectionEventType;
  private parentStateRelativePath = '../..';
  private annotationTypeToSave: AnnotationType;
  private savedMessage: string;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store$: Store<RootStoreState.State>,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.study = this.route.parent.parent.snapshot.data.study;
    this.eventTypeSlug = this.route.snapshot.params.eventTypeSlug;
    this.annotationType = new AnnotationType();

    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.store$.pipe(
      select(EventTypeStoreSelectors.selectAllEventTypes),
      filter((eventTypes: CollectionEventType[]) => eventTypes.length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((eventTypes: CollectionEventType[]) => {
        const entity = eventTypes.find(et => et.slug === this.route.snapshot.params.eventTypeSlug);
        this.eventType = (entity instanceof CollectionEventType)
          ? entity : new CollectionEventType().deserialize(entity);

        if (this.route.snapshot.params.annotationTypeId) {
          this.parentStateRelativePath = '../../..';
          this.annotationType = this.eventType.annotationTypes
            .find(at => at.id == this.route.snapshot.params.annotationTypeId);
        }

        if (this.savedMessage) {
          this.isSaving$.next(false);
          this.toastr.success(this.savedMessage, 'Update Successfull');
          this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
        }
      });

    this.store$
      .pipe(
        select(EventTypeStoreSelectors.selectError),
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

    this.store$.dispatch(new EventTypeStoreActions.GetEventTypeRequest({
      studySlug: this.study.slug,
      eventTypeSlug: this.eventTypeSlug
    }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(annotationType: AnnotationType): void {
    this.isSaving$.next(true);
    this.annotationTypeToSave = annotationType;
    this.store$.dispatch(new EventTypeStoreActions.UpdateEventTypeAddOrUpdateAnnotationTypeRequest({
      eventType: this.eventType,
      annotationType: this.annotationTypeToSave
    }));

    this.savedMessage = this.annotationType.isNew() ? 'Annotation Added' : 'Annotation Updated'
  }

  onCancel(): void {
    this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
  }

}
