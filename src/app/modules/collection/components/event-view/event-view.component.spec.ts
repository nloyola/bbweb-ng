import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, flush, fakeAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEvent, Participant, Specimen } from '@app/domain/participants';
import { CollectionEventType, Study } from '@app/domain/studies';
import { EventStoreActions, EventStoreReducer, EventTypeStoreActions, EventTypeStoreReducer, ParticipantStoreActions, ParticipantStoreReducer, SpecimenStoreActions, SpecimenStoreReducer, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { ToastrModule } from 'ngx-toastr';
import { of as observableOf } from 'rxjs';
import { EventViewComponent } from './event-view.component';

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
  let store: Store<ParticipantStoreReducer.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'event-type': EventTypeStoreReducer.reducer,
          'participant': ParticipantStoreReducer.reducer,
          'event': EventStoreReducer.reducer,
          'specimen': SpecimenStoreReducer.reducer
        }),
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

  xit('entities are loaded from the store', fakeAsync(() => {
    const entities = createEntities();
    const { eventType, event, specimen } = entities;
    fixture.detectChanges();
    const undefinedEntities = {
      event: undefined,
      eventType: undefined,
      specimens: []
    };
    expect(component.entities$).toBeObservable(cold('a|', { a: undefinedEntities }));

    dispatchEntities(entities);
    flush();
    fixture.detectChanges();
    const specimens = [ specimen ];
    expect(component.entities$).toBeObservable(
      cold('(ab)', { a: undefinedEntities, b: { event, eventType, specimens } }));
  }));

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
          slug: participant.slug
        }
      }
    }));
  }

  function createEntities(options: EntitiesOptions = {}) {
    const study = (options.study !== undefined) ? options.study : new Study().deserialize(factory.study());
    const eventType = (options.eventType !== undefined)
      ? options.eventType : new CollectionEventType().deserialize(factory.collectionEventType());
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
    if (study) {
      store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    }

    if (eventType) {
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
    }

    if (participant) {
      store.dispatch(ParticipantStoreActions.getParticipantSuccess({ participant }));
    }

    if (event) {
      store.dispatch(EventStoreActions.getEventSuccess({ event }));
    }

    if (specimen) {
      store.dispatch(SpecimenStoreActions.getSpecimenSuccess({ specimen }));
    }
  }
});
