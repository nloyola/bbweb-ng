import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { EventStoreReducer, EventTypeStoreReducer, NgrxRuntimeChecks, ParticipantStoreReducer, RootStoreState, StudyStoreReducer, EventTypeStoreActions } from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { EventAddFormComponent } from './event-add-form.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { CollectionEvent, Participant, Specimen } from '@app/domain/participants';
import { CollectionEventType, Study, EventTypeInfo } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { of as observableOf } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MockActivatedRoute } from '@test/mocks';

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
        FormsModule,
        ReactiveFormsModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'study':       StudyStoreReducer.reducer,
            'event-type':  EventTypeStoreReducer.reducer,
            'participant': ParticipantStoreReducer.reducer,
            'event':       EventStoreReducer.reducer
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
      declarations: [ EventAddFormComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
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
      const eventTypeInfo = [ new EventTypeInfo().deserialize(factory.entityNameDto(eventType)) ];
      fixture.detectChanges();

      component.form.get('eventType').setValue(eventType.id);
      store.dispatch(EventTypeStoreActions.searchEventTypeNamesSuccess({ eventTypeInfo  }));
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType  }));
      fixture.detectChanges();
      expect((component.annotationsGroup.get('annotations') as FormArray).length)
        .toBe(eventType.annotationTypes.length);
    });

  });

  it('selecting', () => {

  });

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
