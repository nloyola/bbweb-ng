import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { SortDirection } from '@angular/material';
import { ModalComponent } from '@app/modules/modals/components/modal/modal.component';
import { RootStoreState, SpecimenStoreActions, SpecimenStoreReducer } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { LocalTimePipe } from '@app/shared/pipes';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EventSpecCommon } from '@test/event-spec-common';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { SpecimenViewModalComponent } from '../specimen-view-modal/specimen-view-modal.component';
import { EventSpecimensViewComponent } from './event-specimens-view.component';

describe('EventSpecimensViewComponent', () => {
  let component: EventSpecimensViewComponent;
  let fixture: ComponentFixture<EventSpecimensViewComponent>;
  const factory = new Factory();
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        StoreModule.forRoot({ specimen: SpecimenStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      providers: [NgbActiveModal],
      declarations: [EventSpecimensViewComponent, ModalComponent, LocalTimePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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
    const { event } = createEntities();
    const dispatchListener = jest.spyOn(store, 'dispatch');

    fixture.detectChanges();
    expect(component).toBeTruthy();

    expect(dispatchListener.mock.calls.length).toBe(1);
    const action = SpecimenStoreActions.searchSpecimensRequest({
      event,
      searchParams: { sort: 'inventoryId', page: 1, limit: 5 }
    });
    expect(dispatchListener.mock.calls[0][0]).toEqual(action);
  });

  it('should sort by inventory ID by default', () => {
    createEntities();
    fixture.detectChanges();
    expect(component.sortField).toBe('inventoryId');
  });

  it('specimens are loaded from the store', () => {
    const entities = createEntities();
    fixture.detectChanges();
    dispatchEntities(entities);
    expect(component.specimens$).toBeObservable(cold('a', { a: [entities.specimen] }));
  });

  it('tableDataLoading is assigned correctly', () => {
    const entities = createEntities();
    fixture.detectChanges();
    component.ngOnChanges({
      event: new SimpleChange(null, entities.event, false)
    });
    expect(component.tableDataLoading).toBe(true);
    dispatchEntities(entities);
    expect(component.tableDataLoading).toBe(false);
  });

  describe('specimens are reloaded when', () => {
    it('change detection runs', () => {
      const entities = createEntities();
      fixture.detectChanges();

      const dispatchListener = jest.spyOn(store, 'dispatch');
      component.ngOnChanges({
        event: new SimpleChange(null, entities.event, false)
      });

      expect(dispatchListener.mock.calls.length).toBe(1);
      const expectedAction = SpecimenStoreActions.searchSpecimensRequest({
        event: entities.event,
        searchParams: { sort: 'inventoryId', page: 1, limit: 5 }
      });
      expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
    });

    it('a specimen is removed', () => {
      const entities = createEntities();
      fixture.detectChanges();
      dispatchEntities(entities);

      const dispatchListener = jest.spyOn(store, 'dispatch');
      store.dispatch(SpecimenStoreActions.removeSpecimenSuccess({ specimenId: entities.specimen.id }));
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(2);
      const expectedAction = SpecimenStoreActions.searchSpecimensRequest({
        event: entities.event,
        searchParams: { sort: 'inventoryId', page: 1, limit: 5 }
      });
      expect(dispatchListener.mock.calls[1][0]).toEqual(expectedAction);
    });

    it('the user changes the page', () => {
      const entities = createEntities();
      fixture.detectChanges();

      const dispatchListener = jest.spyOn(store, 'dispatch');
      component.paginationPageChanged(1);

      expect(dispatchListener.mock.calls.length).toBe(1);
      const expectedAction = SpecimenStoreActions.searchSpecimensRequest({
        event: entities.event,
        searchParams: { sort: 'inventoryId', page: 1, limit: 5 }
      });
      expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
    });

    it('the table is sorted', () => {
      const entities = createEntities();
      fixture.detectChanges();

      const dispatchListener = jest.spyOn(store, 'dispatch');
      const sortFields = ['inventoryId', 'timeCreated'];
      const sortDirections = ['asc', 'desc', ''] as SortDirection[];

      sortFields.forEach(active => {
        sortDirections.forEach(direction => {
          dispatchListener.mockClear();
          component.sortData({ active, direction });

          expect(dispatchListener.mock.calls.length).toBe(1);
          const sort = (direction === 'desc' ? '-' : '') + (direction === '' ? '' : active);
          const expectedAction = SpecimenStoreActions.searchSpecimensRequest({
            event: entities.event,
            searchParams: { sort, page: 1, limit: 5 }
          });
          expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
        });
      });
    });
  });

  it('viewing a specimen opens a modal', () => {
    const entities = createEntities();
    fixture.detectChanges();

    const modalService = TestBed.get(NgbModal);
    const openListener = jest.spyOn(modalService, 'open').mockReturnValue({
      componentInstance: {},
      result: Promise.resolve('OK')
    });

    component.viewSpecimen(entities.specimen);
    expect(openListener.mock.calls.length).toBe(1);
    expect(openListener.mock.calls[0][0]).toEqual(SpecimenViewModalComponent);
  });

  describe('when removing a specimen', () => {
    let entities: EventSpecCommon.EntitiesOptions;
    let openListener: any;

    beforeEach(() => {
      entities = createEntities();
      fixture.detectChanges();
      const modalService = TestBed.get(NgbModal);
      openListener = jest.spyOn(modalService, 'open').mockReturnValue({
        result: Promise.resolve('OK')
      });
    });

    it('opens a modal', () => {
      component.removeSpecimen(entities.specimen);
      expect(openListener.mock.calls.length).toBe(1);
      expect(openListener.mock.calls[0][0]).toEqual(component.removeSpecimenModal);
    });

    it('when user confirms modal, an action is dispatched', fakeAsync(() => {
      const dispatchListener = jest.spyOn(store, 'dispatch');
      component.removeSpecimen(entities.specimen);
      flush();
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(
        SpecimenStoreActions.removeSpecimenRequest({ specimen: entities.specimen })
      );
    }));
  });

  function createEntities(options: EventSpecCommon.EntitiesOptions = {}): EventSpecCommon.EntitiesOptions {
    const entities = EventSpecCommon.createEntities(options, factory);
    component.participant = entities.participant;
    component.event = entities.event;
    return entities;
  }

  function dispatchEntities(options: EventSpecCommon.EntitiesOptions = {}) {
    EventSpecCommon.dispatchEntities(options, store);

    const pagedReply = factory.pagedReply([options.specimen]);
    pagedReply.searchParams = {
      ...pagedReply.searchParams,
      filter: ''
    };
    store.dispatch(SpecimenStoreActions.searchSpecimensSuccess({ pagedReply }));
  }
});
