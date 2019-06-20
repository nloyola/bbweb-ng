import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEvent, Participant, Specimen } from '@app/domain/participants';
import { CollectionEventType, Study } from '@app/domain/studies';
import { EventStoreActions, EventStoreReducer, EventTypeStoreActions, EventTypeStoreReducer, ParticipantStoreActions, ParticipantStoreReducer, RootStoreState, SpecimenStoreActions, SpecimenStoreReducer, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import * as faker from 'faker';
import { cold } from 'jasmine-marbles';
import { ToastrModule } from 'ngx-toastr';
import { of as observableOf } from 'rxjs';
import { EventViewComponent } from './event-view.component';
import { annotationFromType } from '@app/domain/annotations';
import { By } from '@angular/platform-browser';

interface EntitiesOptions {
  study?: Study;
  eventType?: CollectionEventType;
  participant?: Participant;
  event?: CollectionEvent;
  specimen?: Specimen;
}

describe('EventViewComponent', () => {
  let component: EventViewComponent;
  let fixture: ComponentFixture<EventViewComponent>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'study':       StudyStoreReducer.reducer,
            'event-type':  EventTypeStoreReducer.reducer,
            'participant': ParticipantStoreReducer.reducer,
            'event':       EventStoreReducer.reducer,
            'specimen':    SpecimenStoreReducer.reducer
          },
          NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      providers: [
        NgbActiveModal,
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [ EventViewComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventViewComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
  });

  it('should create', () => {
    createEntities();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('entities are loaded from the store', () => {
    const entities = createEntities();
    const { eventType, event, specimen } = entities;
    const specimens = [ specimen ];
    dispatchEntities(entities);
    fixture.detectChanges();
    expect(component.entities$).toBeObservable(cold('d', { d: { event, eventType, specimens } }));
  });

  it('navigates to new path when visit number is changed', fakeAsync(() => {
    const entities = createEntities();
    const { participant, event } = entities;
    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const modalService = TestBed.get(NgbModal);

    dispatchEntities(entities);
    fixture.detectChanges();

    const newVisitNumber = event.visitNumber + 1;
    const eventWithNewVisitNumber = new CollectionEvent().deserialize({
      ...event,
      visitNumber: newVisitNumber
    });
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newVisitNumber) });

    component.updateVisitNumber();
    flush();
    fixture.detectChanges();

    store.dispatch(EventStoreActions.updateEventSuccess({ event: eventWithNewVisitNumber }));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([
      '/collection', participant.slug, 'collection', 'view', newVisitNumber
    ]);
  }));

  describe('when updating attributes', () => {

    const context: EntityUpdateComponentBehaviour.Context<EventViewComponent> = {} as any;
    let event;

    beforeEach(() => {
      const entities = createEntities();
      event = entities.event;
      context.fixture = fixture;
      context.componentInitialize = () => { dispatchEntities(entities); };
      context.componentValidateInitialization = () => undefined;
      context.dispatchSuccessAction = () => { store.dispatch(EventStoreActions.updateEventSuccess({ event })); };
      context.createExpectedFailureAction =
        (error) => EventStoreActions.updateEventFailure({ error });
      context.duplicateAttibuteValueError = 'visit number already exists';
    });

    describe('when updating visit number', () => {

      beforeEach(() => {
        const newVisitNumber = 999;
        context.modalReturnValue = { result: Promise.resolve(newVisitNumber) };
        context.updateEntity = () => { component.updateVisitNumber(); };

        const updatedEvent = new CollectionEvent().deserialize({
          ...event as any,
          visitNumber: newVisitNumber
        });

        context.expectedSuccessAction = EventStoreActions.updateEventRequest({
          event,
          attributeName: 'visitNumber',
          value: newVisitNumber
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(EventStoreActions.updateEventSuccess({ event: updatedEvent }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);

    });

    describe('when updating time completed', () => {

      beforeEach(() => {
        const newTimeCompleted = faker.date.recent(10);
        context.modalReturnValue = { result: Promise.resolve(newTimeCompleted) };
        context.updateEntity = () => { component.updateTimeCompleted(); };

        const updatedEvent = new CollectionEvent().deserialize({
          ...event as any,
          timeCompleted: newTimeCompleted
        });

        context.expectedSuccessAction = EventStoreActions.updateEventRequest({
          event,
          attributeName: 'timeCompleted',
          value: newTimeCompleted
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(EventStoreActions.updateEventSuccess({ event: updatedEvent }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);

    });

  });

  describe('when updating an annotation', () => {

    const context: EntityUpdateComponentBehaviour.Context<EventViewComponent> = {} as any;

    beforeEach(() => {
      const eventType = new CollectionEventType().deserialize(
        factory.collectionEventType({ annotationTypes: [ factory.annotationType() ] }));
      const entities = createEntities({ eventType });
      const { event } = entities;
      const annotation = annotationFromType(eventType.annotationTypes[0]);
      context.fixture = fixture;
      context.componentInitialize = () => { dispatchEntities(entities); };
      context.componentValidateInitialization = () => undefined;
      context.dispatchSuccessAction =
        () => { store.dispatch(EventStoreActions.updateEventSuccess({ event })); };
      context.createExpectedFailureAction = (error) => EventStoreActions.updateEventFailure({ error });
      context.duplicateAttibuteValueError = undefined;

      context.modalReturnValue = { result: Promise.resolve(annotation) };
      context.updateEntity = () => { component.updateAnnotation(annotation); };

      const updatedEvent = new CollectionEvent().deserialize(event);
      updatedEvent.annotations = [ annotation ];

      context.expectedSuccessAction = EventStoreActions.updateEventRequest({
        event,
        attributeName: 'addOrUpdateAnnotation',
        value: annotation.serverAnnotation()
      });
      context.dispatchSuccessAction = () => {
        store.dispatch(EventStoreActions.updateEventSuccess({ event: updatedEvent }));
      };
    });

    EntityUpdateComponentBehaviour.sharedBehaviour(context);

  });

  describe('when removing an event', () => {

    let modalService : NgbModal;

    beforeEach(() => {
      modalService = TestBed.get(NgbModal);

      spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });
    });

    it('dispatches an event', fakeAsync(() => {
      const entities = createEntities();
      const { event } = entities;

      // do not add the specimen to the store
      dispatchEntities({ ...entities, specimen: undefined });
      fixture.detectChanges();

      const storeListener = jest.spyOn(store, 'dispatch');
      component.remove();
      flush();
      fixture.detectChanges();

      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(EventStoreActions.removeEventRequest({ event }));
    }));

    it('router state is changed when removed', fakeAsync(() => {
      const entities = createEntities();
      const { participant, event } = entities;

      const router = TestBed.get(Router);
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      // do not add the specimen to the store
      dispatchEntities({ ...entities, specimen: undefined });
      fixture.detectChanges();

      component.remove();
      flush();
      fixture.detectChanges();

      store.dispatch(EventStoreActions.removeEventSuccess({ eventId: event.id }));
      flush();
      fixture.detectChanges();

      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual([
        '/collection', participant.slug, 'collection' ]);
    }));

    it('user is informed event cannot be removed when it has specimens', fakeAsync(() => {
      const entities = createEntities();
      const { event } = entities;

      dispatchEntities(entities);
      fixture.detectChanges();

      const storeListener = jest.spyOn(store, 'dispatch');
      component.remove();
      flush();
      fixture.detectChanges();

      expect(storeListener.mock.calls.length).toBe(0);
    }));
  });

  function mockActivatedRouteSnapshot(participant: Participant, event: CollectionEvent): void {
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        parent: {
          parent: {
            snapshot: {
              data: {
                participant
              },
              params: {
                slug: participant.slug
              }
            }
          }
        }
      },
      data: observableOf({ event }),
      snapshot: {
        data: {
          event
        },
        params: {
          visitNumber: event.visitNumber
        }
      }
    }));
  }

  function createEntities(options: EntitiesOptions = {}) {
    const study = (options.study !== undefined) ? options.study : new Study().deserialize(factory.study());
    const eventType = (options.eventType !== undefined)
      ? options.eventType : new CollectionEventType().deserialize(factory.collectionEventType({
        annotationTypes: [ factory.annotationType() ]
      }));
    const participant = (options.participant !== undefined)
      ?  options.participant : new Participant().deserialize(factory.participant());
    const event = (options.event !== undefined)
      ? options.event : new CollectionEvent().deserialize(factory.collectionEvent());
    const specimen = (options.specimen !== undefined)
      ? options.specimen : new Specimen().deserialize(factory.specimen());
    mockActivatedRouteSnapshot(participant, event);
    return { study, participant, eventType, event, specimen };
  }

  function dispatchEntities(options: EntitiesOptions = {}) {
    const { study, eventType, participant, event, specimen } = options;
    if (study) { store.dispatch(StudyStoreActions.getStudySuccess({ study })); }

    if (eventType) { store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType })); }

    if (participant) { store.dispatch(ParticipantStoreActions.getParticipantSuccess({ participant })); }

    if (event) { store.dispatch(EventStoreActions.getEventSuccess({ event })); }

    if (specimen) { store.dispatch(SpecimenStoreActions.getSpecimenSuccess({ specimen })); }
  }
});
