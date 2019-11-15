import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@app/core/services';
import { Annotation, AnnotationFactory } from '@app/domain/annotations';
import { CollectionEvent, Participant } from '@app/domain/participants';
import { CollectionEventType } from '@app/domain/studies';
import {
  EventStoreActions,
  EventStoreSelectors,
  EventTypeStoreActions,
  EventTypeStoreSelectors,
  RootStoreState
} from '@app/root-store';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { AnnotationsAddSubformComponent } from '../annotations-add-subform/annotations-add-subform.component';

@Component({
  selector: 'app-event-add-form',
  templateUrl: './event-add-form.component.html',
  styleUrls: ['./event-add-form.component.scss']
})
export class EventAddFormComponent implements OnInit, OnDestroy {
  participant: Participant;
  eventTypes$: Observable<CollectionEventType[]>;
  isSaving$ = new BehaviorSubject<boolean>(false);
  annotations: Annotation[];
  form: FormGroup;
  faCalendar = faCalendar;

  private eventTypesSubject = new BehaviorSubject(null);
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.participant = this.route.parent.parent.snapshot.data.participant;
    this.form = this.formBuilder.group({
      eventType: ['', [Validators.required]],
      visitNumber: ['', [Validators.required]],
      timeCompleted: ['', [Validators.required]],
      annotationsGroup: this.formBuilder.group({ annotations: new FormArray([]) })
    });

    this.eventTypes$ = this.store$.pipe(
      select(EventTypeStoreSelectors.selectLastNamesSearchEntities),
      tap(eventTypes => {
        if (eventTypes === undefined) {
          return;
        }

        const selectedEventType = eventTypes.find(et => et.id === this.form.value.eventType);
        if (selectedEventType) {
          this.annotations = selectedEventType.annotationTypes.map(at =>
            AnnotationFactory.annotationFromType(at)
          );
          this.annotationsGroup.setControl(
            'annotations',
            AnnotationsAddSubformComponent.buildSubForm(this.annotations, this.unsubscribe$)
          );
        }
      }),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.eventTypes$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.eventTypesSubject);

    this.store$
      .pipe(
        select(EventStoreSelectors.selectCollectionEventLastAdded),
        filter(() => this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(event => {
        const participant = this.route.parent.parent.snapshot.data.participant;
        this.isSaving$.next(false);
        this.notificationService.show();
        this.router.navigate([`/collection/${participant.slug}/collection/view/${event.visitNumber}`]);
      });

    this.store$
      .pipe(
        select(EventStoreSelectors.selectCollectionEventError),
        filter(error => error !== undefined && this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(error => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage && errMessage.match(/already exists/)) {
          errMessage = `That visit number already exists for this participant.`;
        }
        this.notificationService.showError(errMessage, 'Add Error');
        this.isSaving$.next(false);
      });

    this.store$.dispatch(
      EventTypeStoreActions.searchEventTypeNamesRequest({
        studyId: this.participant.study.id,
        searchParams: {}
      })
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get eventType() {
    return this.form.get('eventType');
  }

  get visitNumber() {
    return this.form.get('visitNumber');
  }

  get timeCompleted() {
    return this.form.get('timeCompleted');
  }

  get annotationsGroup(): FormGroup {
    return this.form.get('annotationsGroup') as FormGroup;
  }

  eventTypeTrackBy(_index: number, eventType: CollectionEventType): string {
    return eventType.id;
  }

  onEventTypeSelected() {
    this.store$.dispatch(
      EventTypeStoreActions.getEventTypeByIdRequest({
        studyId: this.participant.study.id,
        eventTypeId: this.form.value.eventType
      })
    );
  }

  onSubmit(): void {
    this.isSaving$.next(true);
    const eventType = this.eventTypesSubject.value.find(
      (et: CollectionEventType) => et.id === this.form.value.eventType
    );
    const event = new CollectionEvent().deserialize({
      participantId: this.route.parent.parent.snapshot.data.participant.id,
      participantSlug: this.route.parent.parent.snapshot.data.participant.slug,
      eventTypeId: eventType.id,
      eventTypeSlug: eventType.slug,
      visitNumber: this.form.value.visitNumber,
      timeCompleted: this.form.value.timeCompleted
    } as any);
    event.annotations = AnnotationsAddSubformComponent.valueToAnnotations(this.annotationsGroup);
    this.store$.dispatch(EventStoreActions.addEventRequest({ event }));
    this.notificationService.add('Event Added', 'Add Successful');
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
