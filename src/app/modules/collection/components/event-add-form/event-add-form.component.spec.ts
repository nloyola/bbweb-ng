import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, flush } from '@angular/core/testing';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEvent, Participant } from '@app/domain/participants';
import { CollectionEventType, EventTypeInfo, Study } from '@app/domain/studies';
import {
  EventStoreActions,
  EventStoreReducer,
  EventTypeStoreActions,
  EventTypeStoreReducer,
  NgrxRuntimeChecks,
  ParticipantStoreReducer,
  RootStoreState,
  StudyStoreReducer
} from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EventAddFormComponent } from './event-add-form.component';
import { TestUtils } from '@test/utils';

interface EntitiesOptions {
  study?: Study;
  eventType?: CollectionEventType;
  participant?: Participant;
  event?: CollectionEvent;
}

describe('ParticipantAddEventComponent', () => {
  let component: EventAddFormComponent;
  let fixture: ComponentFixture<EventAddFormComponent>;
  const factory = new Factory();
  let store: Store<RootStoreState.State>;
  const mockActivatedRoute = new MockActivatedRoute();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            study: StudyStoreReducer.reducer,
            'event-type': EventTypeStoreReducer.reducer,
            participant: ParticipantStoreReducer.reducer,
            event: EventStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [EventAddFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAddFormComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
  });

  it('should create', () => {
    createEntities();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    createEntities();
    fixture.detectChanges();
    expect(component.form.valid).toBeFalsy();
  });

  describe('eventType input validity', () => {
    it('is required', () => {
      createEntities();
      fixture.detectChanges();
      const errors = component.eventType.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      const { eventType } = createEntities();
      fixture.detectChanges();
      component.eventType.setValue(eventType.id);
      const errors = component.eventType.errors || {};
      expect(errors).toEqual({});
    });
  });

  describe('visitNumber input validity', () => {
    it('is required', () => {
      createEntities();
      fixture.detectChanges();
      const errors = component.visitNumber.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      const { event } = createEntities();
      fixture.detectChanges();
      component.visitNumber.setValue(event.visitNumber);
      const errors = component.visitNumber.errors || {};
      expect(errors).toEqual({});
    });
  });

  describe('timeCompleted input validity', () => {
    it('is required', () => {
      createEntities();
      fixture.detectChanges();
      const errors = component.timeCompleted.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      const { event } = createEntities();
      fixture.detectChanges();
      component.timeCompleted.setValue(event.timeCompleted);
      const errors = component.timeCompleted.errors || {};
      expect(errors).toEqual({});
    });
  });

  describe('annotation group is initialized', () => {
    it('empty on initialization', () => {
      fixture.detectChanges();
      expect((component.annotationsGroup.get('annotations') as FormArray).length).toBe(0);
    });

    it('recreated when event type is selected', () => {
      const { eventType } = createEntities();
      const eventTypeData = [new EventTypeInfo().deserialize(factory.entityNameDto(eventType))];
      fixture.detectChanges();

      component.eventType.setValue(eventType.id);
      store.dispatch(
        EventTypeStoreActions.searchEventTypeNamesRequest({
          studyId: eventType.studyId,
          searchParams: {}
        })
      );
      store.dispatch(EventTypeStoreActions.searchEventTypeNamesSuccess({ eventTypeData }));
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      fixture.detectChanges();
      expect((component.annotationsGroup.get('annotations') as FormArray).length).toBe(
        eventType.annotationTypes.length
      );
    });
  });

  it('selecting an event type dispatches an action', () => {
    const { participant, eventType } = createEntities();
    fixture.detectChanges();
    component.eventType.setValue(eventType.id);

    const storeListener = jest.spyOn(store, 'dispatch');
    component.onEventTypeSelected();
    fixture.detectChanges();

    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0]).toEqual(
      EventTypeStoreActions.getEventTypeByIdRequest({
        studyId: participant.study.id,
        eventTypeId: eventType.id
      })
    );
  });

  describe('when submitting', () => {
    const testCommon = (event: CollectionEvent, eventType: CollectionEventType) => {
      component.eventType.setValue(eventType.id);
      const eventTypeData = [new EventTypeInfo().deserialize(factory.entityNameDto(eventType))];
      store.dispatch(EventTypeStoreActions.searchEventTypeNamesSuccess({ eventTypeData }));
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      fixture.detectChanges();

      component.visitNumber.setValue(event.visitNumber);
      component.timeCompleted.setValue(event.timeCompleted);
      component.onSubmit();
      fixture.detectChanges();

      TestUtils.routerNavigateListener();
    };

    it('isSaving$ is used correctly', () => {
      const { event, eventType } = createEntities();
      fixture.detectChanges();
      expect(component.isSaving$).toBeObservable(cold('a', { a: false }));

      testCommon(event, eventType);
      expect(component.isSaving$).toBeObservable(cold('a', { a: true }));

      store.dispatch(EventStoreActions.addEventSuccess({ event }));
      fixture.detectChanges();
      expect(component.isSaving$).toBeObservable(cold('a', { a: false }));
    });

    it('dispatches action to add an event', () => {
      const { event, eventType } = createEntities();
      fixture.detectChanges();

      const storeListener = TestUtils.storeDispatchListener();
      testCommon(event, eventType);

      expect(storeListener.mock.calls.length).toBe(3);
      const eventToAdd = new CollectionEvent().deserialize({
        ...event,
        id: undefined,
        slug: undefined,
        version: undefined,
        annotations: [
          {
            annotationTypeId: eventType.annotationTypes[0].id,
            valueType: eventType.annotationTypes[0].valueType,
            id: null,
            value: null
          }
        ]
      });
      expect(storeListener.mock.calls[2][0]).toEqual(
        EventStoreActions.addEventRequest({ event: eventToAdd })
      );
    });

    it('user is informed', () => {
      const { event, eventType } = createEntities();
      fixture.detectChanges();

      testCommon(event, eventType);

      const toastrListener = TestUtils.toastrSuccessListener();
      store.dispatch(EventStoreActions.addEventSuccess({ event }));
      fixture.detectChanges();
      expect(toastrListener.mock.calls.length).toBe(1);
    });

    it('on submission failure', fakeAsync(() => {
      const toastr = TestBed.get(ToastrService);
      const toastrErrorListener = jest.spyOn(toastr, 'error').mockReturnValue(null);
      const errors = [
        {
          status: 401,
          statusText: 'Unauthorized'
        },
        {
          status: 404,
          error: {
            message: 'simulated error'
          }
        },
        {
          status: 404,
          error: {
            message: 'already exists'
          }
        }
      ];

      const { event, eventType } = createEntities();
      fixture.detectChanges();

      errors.forEach(error => {
        toastrErrorListener.mockClear();
        testCommon(event, eventType);

        const action = EventStoreActions.addEventFailure({ error });
        store.dispatch(action);
        flush();
        fixture.detectChanges();
        expect(toastrErrorListener.mock.calls.length).toBe(1);
      });
    }));
  });

  it('on cancel, navigates to correct state', () => {
    const router = TestBed.get(Router);
    const navigateListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    createEntities();
    fixture.detectChanges();
    component.onCancel();
    expect(navigateListener.mock.calls.length).toBe(1);
    expect(navigateListener.mock.calls[0][0]).toEqual(['..']);
  });

  function createEntities(options: EntitiesOptions = {}) {
    const study = options.study !== undefined ? options.study : new Study().deserialize(factory.study());
    const eventType =
      options.eventType !== undefined
        ? options.eventType
        : new CollectionEventType().deserialize(
            factory.collectionEventType({
              annotationTypes: [factory.annotationType()]
            })
          );
    const participant =
      options.participant !== undefined
        ? options.participant
        : new Participant().deserialize(factory.participant());
    const event =
      options.event !== undefined
        ? options.event
        : new CollectionEvent().deserialize(factory.collectionEvent());
    mockActivatedRouteSnapshot(participant);
    return { study, participant, eventType, event };
  }

  function mockActivatedRouteSnapshot(participant: Participant): void {
    mockActivatedRoute.spyOnParent(() => ({
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
    }));
  }
});
