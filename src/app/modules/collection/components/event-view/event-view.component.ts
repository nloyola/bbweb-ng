import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionEvent } from '@app/domain/participants';
import { CollectionEventType } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState, EventStoreActions } from '@app/root-store';
import { Dictionary } from '@ngrx/entity';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil, tap, withLatestFrom, shareReplay, take } from 'rxjs/operators';
import { annotationFromType, Annotation } from '@app/domain/annotations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

interface EntityData {
  event: CollectionEvent;
  eventType: CollectionEventType;
}

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit, OnDestroy {

  @ViewChild('updateVisitNumberModal') updateVisitNumberModal: TemplateRef<any>;
  @ViewChild('updateAnnotationModal') updateAnnotationModal: TemplateRef<any>;

  data$: Observable<EntityData>;
  event$: Observable<CollectionEvent>;
  eventTypes$: Observable<Dictionary<CollectionEventType>>;
  eventType$: Observable<CollectionEventType>;
  annotations$: Observable<Annotation[]>;

  private visitNumber: number;
  private annotationToEdit: Annotation;
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.visitNumber = this.route.parent.snapshot.params.visitNumber;
    this.eventTypes$ = this.store$.pipe(select(EventTypeStoreSelectors.selectAllEventTypeEntities));

    this.data$ = combineLatest(this.route.parent.data, this.eventTypes$).pipe(
      map(([routeData, eventTypes]) => {
        const event = routeData.event;
        const eventType = eventTypes[event.eventTypeId];

        if (eventType === undefined) {
          this.store$.dispatch(EventTypeStoreActions.getEventTypeByIdRequest({
            studyId: this.route.parent.parent.parent.parent.snapshot.data.participant.study.id,
            eventTypeId: event.eventTypeId
          }));
        }

        return { event, eventType };
      }),
      takeUntil(this.unsubscribe$),
      shareReplay());

    this.event$ = this.data$.pipe(map(entities => entities.event));
    this.eventType$ = this.data$.pipe(map(entities => entities.eventType));

    this.annotations$ = this.data$.pipe(map(entities => {
      if (entities.eventType === undefined) { return []; }

      return entities.eventType.annotationTypes.map(at => {
        const annotation = annotationFromType(at);
        const participantAnnotation =
          entities.event.annotations.find(a => a.annotationTypeId === annotation.annotationTypeId);
        if (participantAnnotation) {
          annotation.value = participantAnnotation.value;
        }
        return annotation;
      });
    }));

    this.data$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ entities, message ]) => {
      if (entities === undefined) { return; }

      if (entities.event.visitNumber === this.visitNumber) {
        this.toastr.success(message, 'Update Successfull');
      } else {
        // uniqueId was changed and a new slug was assigned
        //
        // need to change state since slug is used in URL and by breadcrumbs
        this.router.navigate([ '../..', entities.event.visitNumber, 'view' ], { relativeTo: this.route });
        this.visitNumber = entities.event.visitNumber;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateVisitNumber() {
  }

  updateTimeCompleted() {
  }

  updateAnnotation(annotation: Annotation) {
    let entities: EntityData;
    this.data$.pipe(take(1)).subscribe(e => entities = e);
    this.annotationToEdit = annotation;

    this.modalService.open(this.updateAnnotationModal, { size: 'lg' }).result
      .then(value => {
        const updatedAnnotation = value;
        this.store$.dispatch(EventStoreActions.updateEventRequest({
          event: entities.event,
          attributeName: 'addOrUpdateAnnotation',
          value: updatedAnnotation.serverAnnotation()
        }));
        this.updatedMessage$.next(`${annotation.label} was updated`);
      })
      .catch(() => {
        // don't care if user pressed the Cancel button
      });
  }

}
