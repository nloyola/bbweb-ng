import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, Study } from '@app/domain/studies';
import { CollectedSpecimenDefinition } from '@app/domain/studies/collected-specimen-definition.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import {
  EventTypeStoreActions,
  EventTypeStoreSelectors,
  RootStoreState,
  StudyStoreSelectors
} from '@app/root-store';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom } from 'rxjs/operators';
import { EventTypeRemoveComponent } from '../event-type-remove/event-type-remove.component';
import { SpecimenDefinitionRemoveComponent } from '../specimen-definition-remove/specimen-definition-remove.component';
import { SpecimenDefinitionViewComponent } from '../specimen-definition-view/specimen-definition-view.component';

interface StoreData {
  study: Study;
  eventType: CollectionEventType;
  eventTypes: Dictionary<CollectionEventType>;
}

@Component({
  selector: 'app-event-type-view',
  templateUrl: './event-type-view.container.html'
})
export class EventTypeViewContainerComponent implements OnInit, OnDestroy {
  @ViewChild('updateNameModal', { static: false }) updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal', { static: false }) updateDescriptionModal: TemplateRef<any>;
  @ViewChild('updateRecurringModal', { static: false }) updateRecurringModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  eventType$: Observable<CollectionEventType>;
  allowChanges$: Observable<boolean>;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;

  private eventTypeId: string;
  private data$: Observable<StoreData>;
  private dataSubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.eventTypeId = this.route.snapshot.data.eventType.id;
    this.route.data.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      if (this.eventTypeId !== data.eventType.id) {
        // user selected a different event type
        this.eventTypeId = data.eventType.id;
        this.updatedMessage$.next(null);
      }
    });

    const entitiesSelector = createSelector(
      StudyStoreSelectors.selectAllStudyEntities,
      EventTypeStoreSelectors.selectAllEventTypeEntities,
      (studies: Dictionary<Study>, eventTypes: Dictionary<CollectionEventType>) => {
        let study: Study;
        const studyEntity = studies[this.route.snapshot.data.eventType.studyId];
        if (studyEntity) {
          study = studyEntity instanceof Study ? studyEntity : new Study().deserialize(studyEntity);
        }
        return {
          study,
          eventTypes,
          eventType: undefined
        };
      }
    );

    this.data$ = combineLatest([this.route.data, this.store$.pipe(select(entitiesSelector))]).pipe(
      map(([routeData, entities]) => {
        const eventType = entities.eventTypes[routeData.eventType.id];

        return {
          ...entities,
          eventType
        };
      }),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.data$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.dataSubject);
    this.eventType$ = this.data$.pipe(map(entities => entities.eventType));
    this.allowChanges$ = this.data$.pipe(map(entities => entities.study.isDisabled()));
    this.isLoading$ = this.data$.pipe(map(data => data === undefined || data.eventType === undefined));

    this.data$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([data, msg]) => {
        if (msg === null) {
          return;
        }

        if (data.eventType !== undefined) {
          this.toastr.success(msg, 'Update Successfull');

          if (data.eventType.slug !== this.route.snapshot.params.eventTypeSlug) {
            // name was changed and new slug was assigned
            //
            // need to change state since slug is used in URL and by breadcrumbs
            this.router.navigate([
              '/admin/studies',
              data.study.slug,
              'collection',
              'view',
              data.eventType.slug
            ]);
          }
        } else {
          this.toastr.success(msg, 'Remove Successfull');
          this.router.navigate(['/admin/studies', data.study.slug, 'collection', 'view']);
        }

        this.updatedMessage$.next(null);
      });

    this.store$
      .pipe(
        select(EventTypeStoreSelectors.selectError),
        filter(error => !!error),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage.indexOf('already exists') > -1) {
          errMessage = 'A participant with that unique ID already exists. Please use a different one.';
        }
        this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName() {
    this.whenStudyDisabled((study, eventType) => {
      this.updateNameModalOptions = {
        required: true,
        minLength: 2
      };
      this.modalService
        .open(this.updateNameModal, { size: 'lg' })
        .result.then(value => {
          this.store$.dispatch(
            EventTypeStoreActions.updateEventTypeRequest({
              eventType,
              attributeName: 'name',
              value
            })
          );
          this.updatedMessage$.next('Event name was updated');
        })
        .catch(() => undefined);
    });
  }

  updateDescription() {
    this.whenStudyDisabled((study, eventType) => {
      this.updateDescriptionModalOptions = {
        rows: 20,
        cols: 10
      };
      this.modalService
        .open(this.updateDescriptionModal, { size: 'lg' })
        .result.then((value: string) => {
          this.store$.dispatch(
            EventTypeStoreActions.updateEventTypeRequest({
              eventType,
              attributeName: 'description',
              value
            })
          );
          this.updatedMessage$.next('Event description was updated');
        })
        .catch(() => undefined);
    });
  }

  updateRecurring() {
    this.whenStudyDisabled((study, eventType) => {
      this.modalService
        .open(this.updateRecurringModal, { size: 'lg' })
        .result.then(value => {
          this.store$.dispatch(
            EventTypeStoreActions.updateEventTypeRequest({
              eventType,
              attributeName: 'recurring',
              value
            })
          );
          this.updatedMessage$.next('Recurring was updated');
        })
        .catch(() => undefined);
    });
  }

  addAnnotationType() {
    this.whenStudyDisabled(() => {
      this.router.navigate(['annotationAdd'], { relativeTo: this.route });
    });
  }

  viewAnnotationType(annotationType: AnnotationType): void {
    const modalRef = this.modalService.open(AnnotationTypeViewComponent, { size: 'lg' });
    modalRef.componentInstance.annotationType = annotationType;

    // nothing is done with this modal's result
    modalRef.result.then(() => undefined).catch(() => undefined);
  }

  editAnnotationType(annotationType: AnnotationType): void {
    this.whenStudyDisabled(() => {
      this.router.navigate(['annotation', annotationType.id], { relativeTo: this.route });
    });
  }

  removeAnnotationType(annotationType: AnnotationType): void {
    this.whenStudyDisabled((study, eventType) => {
      const modalRef = this.modalService.open(AnnotationTypeRemoveComponent);
      modalRef.componentInstance.annotationType = annotationType;
      modalRef.result
        .then(() => {
          this.store$.dispatch(
            EventTypeStoreActions.updateEventTypeRequest({
              eventType,
              attributeName: 'removeAnnotationType',
              value: annotationType.id
            })
          );

          this.updatedMessage$.next('Annotation removed');
        })
        .catch(() => undefined);
    });
  }

  addSpecimenDefinition() {
    this.whenStudyDisabled(() => {
      this.router.navigate(['spc-def-add'], { relativeTo: this.route });
    });
  }

  viewSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    const modalRef = this.modalService.open(SpecimenDefinitionViewComponent, { size: 'lg' });
    modalRef.componentInstance.specimenDefinition = specimenDefinition;

    // nothing is done with this modal's result
    modalRef.result.then(() => undefined).catch(() => undefined);
  }

  editSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    this.whenStudyDisabled(() => {
      this.router.navigate(['spc-def', specimenDefinition.id], { relativeTo: this.route });
    });
  }

  removeSpecimenDefinition(specimenDefinition: CollectedSpecimenDefinition): void {
    this.whenStudyDisabled((study, eventType) => {
      const modalRef = this.modalService.open(SpecimenDefinitionRemoveComponent);
      modalRef.componentInstance.specimenDefinition = specimenDefinition;
      modalRef.result
        .then(() => {
          this.store$.dispatch(
            EventTypeStoreActions.updateEventTypeRequest({
              eventType,
              attributeName: 'removeSpecimenDefinition',
              value: specimenDefinition.id
            })
          );

          this.updatedMessage$.next('Specimen removed');
        })
        .catch(() => undefined);
    });
  }

  removeEventType() {
    this.whenStudyDisabled((study, eventType) => {
      const modalRef = this.modalService.open(EventTypeRemoveComponent);
      modalRef.componentInstance.eventType = eventType;
      modalRef.result
        .then(() => {
          this.store$.dispatch(EventTypeStoreActions.removeEventTypeRequest({ eventType }));

          this.updatedMessage$.next('Event removed');
        })
        .catch(() => undefined);
    });
  }

  addEventTypeSelected() {
    this.whenStudyDisabled((study, _eventType) => {
      // relative route does not work here, why?
      this.router.navigate([`/admin/studies/${study.slug}/collection/add`]);
    });
  }

  eventTypeSelected(eventType: CollectionEventType) {
    this.whenStudyDisabled((study, _eventType) => {
      // relative route does not work here, why?
      this.router.navigate([`/admin/studies/${study.slug}/collection/${eventType.slug}`]);
    });
  }

  private whenStudyDisabled(fn: (study: Study, eventType: CollectionEventType) => void) {
    const study = this.dataSubject.value.study;
    if (!study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    fn(study, this.dataSubject.value.eventType);
  }
}
