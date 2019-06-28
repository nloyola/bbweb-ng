import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalInputComponent } from '@app/modules/modals/components/modal-input/modal-input.component';
import { SpecimenStoreReducer, SpecimenStoreActions, RootStoreState } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule, Store } from '@ngrx/store';
import { EventSpecimensViewComponent } from './event-specimens-view.component';
import { EventSpecCommon } from '@test/event-spec-common';
import { SearchParams } from '@app/domain';
import { Factory } from '@test/factory';

describe('EventSpecimensViewComponent', () => {
  let component: EventSpecimensViewComponent;
  let fixture: ComponentFixture<EventSpecimensViewComponent>;
  const factory = new Factory();
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        StoreModule.forRoot(
          { 'specimen': SpecimenStoreReducer.reducer },
          NgrxRuntimeChecks
        )
      ],
      providers: [
        NgbActiveModal
      ],
      declarations: [
        EventSpecimensViewComponent,
        ModalInputComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSpecimensViewComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
  });

  it('should create', () => {
    createEntities();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('dispatches action to retrieve a page of specimens', () => {
    const { participant, event } = createEntities();
    const dispatchListener = jest.spyOn(store, 'dispatch');

    fixture.detectChanges();
    expect(component).toBeTruthy();

    expect(dispatchListener.mock.calls.length).toBe(1);
    const action = SpecimenStoreActions.searchSpecimensRequest({
      event,
      searchParams: new SearchParams('', 'inventoryId', 1, 5)
    });
    expect(dispatchListener.mock.calls[0][0]).toEqual(action);
  });

  it('should sort by inventory ID by default', () => {
    createEntities();
    fixture.detectChanges();
    expect(component.sortField).toBe('inventoryId');
  });

  it('specimens are loaded from the store', () => {
    const { specimen } = createEntities();
    fixture.detectChanges();

  });

  function createEntities(options: EventSpecCommon.EntitiesOptions = {}) {
    const entities = EventSpecCommon.createEntities(options, factory);
    component.participant = entities.participant;
    component.event = entities.event;
    return entities;
  }

  function dispatchEntities(options: EventSpecCommon.EntitiesOptions = {}) {
    EventSpecCommon.dispatchEntities(options, store);
  }
});
