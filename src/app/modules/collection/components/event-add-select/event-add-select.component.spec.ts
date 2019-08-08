import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitNumberFilter } from '@app/domain/search-filters';
import {
  EventStoreActions,
  EventStoreReducer,
  EventTypeStoreReducer,
  NgrxRuntimeChecks,
  RootStoreState,
  StudyStoreReducer
} from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { EventSpecCommon } from '@test/event-spec-common';
import { Factory } from '@test/factory';
import { EventAddSelectComponent } from './event-add-select.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EventAddSelectComponent', () => {
  let component: EventAddSelectComponent;
  let fixture: ComponentFixture<EventAddSelectComponent>;
  const factory = new Factory();
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        StoreModule.forRoot(
          {
            study: StudyStoreReducer.reducer,
            'event-type': EventTypeStoreReducer.reducer,
            event: EventStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [EventAddSelectComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAddSelectComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('common functionality', () => {
    it('makes a request from the server', () => {
      const entities = createEntities();
      const storeListener = jest.spyOn(store, 'dispatch');
      const filter = new VisitNumberFilter();
      //const filterValue = '1';
      //filter.setValue(filterValue);
      const testData = [
        // FIXME: visit number filter has to be modified via the form's input tag
        // {
        //   componentFunc: () => component.onFiltersUpdated(filterValue),
        //   expectedAction: EventStoreActions.searchEventsRequest({
        //     participant: entities.participant,
        //     searchParams: { filter: filter.getValue(), sort: 'visitNumber', page: 1, limit: 5 }
        //   })
        // },
        {
          componentFunc: () => component.paginationPageChange(),
          expectedAction: EventStoreActions.searchEventsRequest({
            participant: entities.participant,
            searchParams: { filter: filter.getValue(), sort: 'visitNumber', page: 1, limit: 5 }
          })
        }
      ];

      component.participant = entities.participant;
      fixture.detectChanges();
      testData.forEach(testInfo => {
        storeListener.mockReset();
        testInfo.componentFunc();
        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(testInfo.expectedAction);
      });
    });

    it('test for emitters', () => {
      const entities = createEntities();
      const testData = [
        {
          componentFunc: () => component.add(),
          emitter: component.addSelected
        },
        {
          componentFunc: () => component.eventSelected(entities.event),
          emitter: component.selected
        }
      ];
      jest.spyOn(store, 'dispatch');

      component.participant = entities.participant;
      fixture.detectChanges();
      testData.forEach(testInfo => {
        const emitListener = jest.spyOn(testInfo.emitter, 'emit').mockReturnValue(null);
        testInfo.componentFunc();
        expect(emitListener.mock.calls.length).toBe(1);
      });
    });
  });

  it('removing an event causes a page reload', () => {
    const entities = createEntities();
    const expectedAction = EventStoreActions.searchEventsRequest({
      participant: entities.participant,
      searchParams: { filter: '', sort: 'visitNumber', page: 1, limit: 5 }
    });

    component.participant = entities.participant;
    fixture.detectChanges();

    const storeListener = jest.spyOn(store, 'dispatch');
    store.dispatch(EventStoreActions.removeEventSuccess({ eventId: entities.event.id }));
    fixture.detectChanges();

    expect(storeListener.mock.calls.length).toBe(2);
    expect(storeListener.mock.calls[1][0]).toEqual(expectedAction);
  });

  function createEntities(options: EventSpecCommon.EntitiesOptions = {}) {
    const entities = EventSpecCommon.createEntities(options, factory);
    return entities;
  }
});
