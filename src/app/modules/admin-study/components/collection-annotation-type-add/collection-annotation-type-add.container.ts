import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { select, Store, createSelector } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, takeUntil, map, tap, withLatestFrom, shareReplay } from 'rxjs/operators';

interface StoreData {
  study: Study;
  eventType: CollectionEventType;
  annotationType: AnnotationType;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-collection-annotation-type-add',
  templateUrl: './collection-annotation-type-add.container.html'
})
export class CollectionAnnotationTypeAddContainerComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  data$: Observable<StoreData>;
  eventType: CollectionEventType;
  annotationType$: Observable<AnnotationType>;
  isSaving$ = new BehaviorSubject<boolean>(false);

  private parentStateRelativePath = '..';
  private annotationType: AnnotationType;
  private annotationTypeToSave: AnnotationType;
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store$: Store<RootStoreState.State>,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    const entitiesSelector = createSelector(
      StudyStoreSelectors.selectAllStudies,
      EventTypeStoreSelectors.selectAllEventTypes,
      (studies: Study[], eventTypes: CollectionEventType[]) => ({ studies, eventTypes }));

    this.data$ = this.store$.pipe(
      select(entitiesSelector),
      map(data => {
        const studyEntity = data.studies
          .find(s => s.slug === this.route.parent.parent.parent.parent.snapshot.params.slug);
        if (!studyEntity) {
          throw new Error('study not found');
        }

        const etEntity = data.eventTypes.find(et => et.slug === this.route.snapshot.params.eventTypeSlug);
        if (!etEntity) {
          throw new Error('event type not found');
        }

        const study = (studyEntity instanceof Study) ? studyEntity :  new Study().deserialize(studyEntity);
        const eventType = (etEntity instanceof CollectionEventType)
          ? etEntity : new CollectionEventType().deserialize(etEntity);
        const annotationType = this.route.snapshot.params.annotationTypeId
          ? eventType.annotationTypes.find(at => at.id === this.route.snapshot.params.annotationTypeId)
          : new AnnotationType();

        return {
          study,
          eventType,
          annotationType
        };
      }),
      tap(data => {
        this.eventType = data.eventType;
        this.annotationType = data.annotationType;
      }),
      shareReplay());

    this.annotationType$ = this.data$.pipe(map(data => data.annotationType));

    this.data$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ _data, msg ]) => {
      this.isSaving$.next(false);
      this.toastr.success(msg, 'Update Successfull');
      this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
    });

    this.store$
      .pipe(
        select(EventTypeStoreSelectors.selectError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        this.isSaving$.next(false);
        let errMessage = error.error ? error.error.message : error.statusText;
        if (errMessage && errMessage.match(/EntityCriteriaError.*name already used/)) {
          errMessage = `The name is already in use: ${this.annotationTypeToSave.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });

    this.store$.dispatch(new EventTypeStoreActions.GetEventTypeRequest({
      studySlug: this.route.parent.parent.parent.parent.snapshot.params.slug,
      eventTypeSlug: this.route.snapshot.params.eventTypeSlug
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

    this.updatedMessage$.next(this.annotationType.isNew() ? 'Annotation Added' : 'Annotation Updated');
  }

  onCancel(): void {
    this.router.navigate([ this.parentStateRelativePath ], { relativeTo: this.route });
  }

}
