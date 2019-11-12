import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchParams } from '@app/domain';
import { Participant, CollectionEvent } from '@app/domain/participants';
import { CollectionEventType } from '@app/domain/studies';
import {
  EventTypeStoreActions,
  EventTypeStoreSelectors,
  RootStoreState,
  EventStoreActions,
  EventStoreSelectors
} from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, tap, withLatestFrom, filter, shareReplay } from 'rxjs/operators';
import { AnnotationsAddSubformComponent } from '../annotations-add-subform/annotations-add-subform.component';
import { Annotation, AnnotationFactory } from '@app/domain/annotations';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';

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
  private addedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
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
        withLatestFrom(this.addedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([event, msg]) => {
        const participant = this.route.parent.parent.snapshot.data.participant;
        this.isSaving$.next(false);
        this.toastr.success(msg, 'Add Successful');
        this.router.navigate([`/collection/${participant.slug}/collection/view/${event.visitNumber}`]);
      });

    this.store$
      .pipe(
        select(EventStoreSelectors.selectCollectionEventError),
        filter(error => error !== undefined),
        withLatestFrom(this.addedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage.match(/already exists/)) {
          errMessage = `That visit number already exists for this participant.`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
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
    const eventType = this.eventTypesSubject.value.find(et => et.id === this.form.value.eventType);
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
    this.addedMessage$.next('Event Added');
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
