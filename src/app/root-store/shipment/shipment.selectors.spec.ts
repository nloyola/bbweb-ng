import { ShipmentStoreReducer, ShipmentStoreSelectors } from '@app/root-store';
import { Factory } from '@test/factory';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Shipment } from '@app/domain/shipments';
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';

describe('shipment-store selectors', () => {

  const factory = new Factory();

  it('selectShipmentLastAdded', () => {
    const shipment = factory.shipment();
    const state = {
      shipment: {
        ...ShipmentStoreReducer.initialState,
        lastAddedId: shipment.id
      }
    };

    expect(ShipmentStoreSelectors.selectShipmentLastAddedId(state)).toBe(shipment.id);
  });

  it('selectShipmentLastRemoved', () => {
    const shipment = factory.shipment();
    const state = {
      shipment: {
        ...ShipmentStoreReducer.initialState,
        lastRemovedId: shipment.id
      }
    };

    expect(ShipmentStoreSelectors.selectShipmentLastRemovedId(state)).toBe(shipment.id);
  });

  it('selectShipmentSearchActive', () => {
    const state = {
      shipment: {
        ...ShipmentStoreReducer.initialState,
        searchActive: true
      }
    };

    expect(ShipmentStoreSelectors.selectShipmentSearchActive(state)).toBeTruthy();
  });

  it('selectShipmentLastSearch', () => {
    const searchParams = new SearchParams();
    const state = {
      shipment: {
        ...ShipmentStoreReducer.initialState,
        lastSearch: searchParams
      }
    };

    expect(ShipmentStoreSelectors.selectShipmentLastSearch(state)).toBe(searchParams);
  });

  it('selectShipmentSearchReplies', () => {
    const shipment = factory.shipment();
    const pagedReply = factory.pagedReply<Shipment>([ shipment ]);
    const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
    searchReplies[pagedReply.searchParams.queryString()] = {
      searchParams: pagedReply.searchParams,
      offset: pagedReply.offset,
      total: pagedReply.total,
      entityIds: pagedReply.entities.map(e => e.id),
      maxPages: pagedReply.maxPages,
    };
    const state = {
      shipment: {
        ...ShipmentStoreReducer.initialState,
        searchReplies
      }
    };

    expect(ShipmentStoreSelectors.selectShipmentSearchReplies(state)).toBe(searchReplies);
  });

  it('selectAllShipments', () => {
    const shipment = factory.shipment();
    const adapter: EntityAdapter<Shipment> = createEntityAdapter<Shipment>({
      selectId: (s: Shipment) => s.id
    });
    const state = {
      shipment: adapter.addAll([ shipment ], ShipmentStoreReducer.initialState)
    };

    expect(ShipmentStoreSelectors.selectAllShipments(state)).toEqual([ shipment ]);
  });

  describe('selectShipmentSearchRepliesAndEntities', () => {

    it('when search has completed', () => {
      const shipment = factory.shipment();
      const adapter: EntityAdapter<Shipment> = createEntityAdapter<Shipment>({
        selectId: (s: Shipment) => s.id
      });
      const pagedReply = factory.pagedReply<Shipment>([ shipment ]);
      const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
      searchReplies[pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        entityIds: pagedReply.entities.map(e => e.id),
        maxPages: pagedReply.maxPages
      };
      const state = {
        shipment: adapter.addAll([ shipment ], {
          ...ShipmentStoreReducer.initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies
        })
      };

      expect(ShipmentStoreSelectors.selectShipmentSearchRepliesAndEntities(state)).toEqual({
        entities: [ shipment ],
        hasNoEntitiesToDisplay: false,
        hasNoResultsToDisplay: false,
        hasResultsToDisplay: true,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages,
        showPagination: false
      });
    });

    it('when there is no last search', () => {
      const state = {
        shipment: {
          ...ShipmentStoreReducer.initialState,
          searchActive: false,
          lastSearch: null
        }
      };

      expect(ShipmentStoreSelectors.selectShipmentSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when reply is missing', () => {
      const shipment = factory.shipment();
      const adapter: EntityAdapter<Shipment> = createEntityAdapter<Shipment>({
        selectId: (s: Shipment) => s.id
      });
      const pagedReply = factory.pagedReply<Shipment>([ shipment ]);
      const state = {
        shipment: adapter.addAll([ shipment ], {
          ...ShipmentStoreReducer.initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies: {}
        })
      };

      expect(ShipmentStoreSelectors.selectShipmentSearchRepliesAndEntities(state)).toBeUndefined();
    });

  });

  it('selectShipmentLastRemoved', () => {
    const shipment = factory.shipment();
    const adapter: EntityAdapter<Shipment> = createEntityAdapter<Shipment>({
      selectId: (s: Shipment) => s.id
    });
    const state = {
      shipment: adapter.addAll([ shipment ], {
        ...ShipmentStoreReducer.initialState,
        lastRemovedId: shipment.id
      })
    };

    expect(ShipmentStoreSelectors.selectShipmentLastRemoved(state)).toEqual(shipment);
  });

  it('selectCanAddInventoryId', () => {
    const specimen = factory.specimen();
    const state = {
      shipment: {
        ...ShipmentStoreReducer.initialState,
        canAddSpecimenInventoryIds: [ specimen.inventoryId as string ]
      }
    };
    expect(ShipmentStoreSelectors.selectCanAddInventoryId(state)).toEqual([ specimen.inventoryId ]);
  });

});
