import { Factory } from '@test/factory';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { ShipmentSpecimen } from '@app/domain/shipments';
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { initialState, reducer } from './shipment-specimen.reducer';
import * as selectors from './shipment-specimen.selectors';

describe('shipmentSpecimen-store selectors', () => {

  const factory = new Factory();

  it('selectShipmentSpecimenLastRemoved', () => {
    const shipmentSpecimen = factory.shipmentSpecimen();
    const state = {
      'shipment-specimen': {
        ...initialState,
        lastRemovedId: shipmentSpecimen.id
      }
    };

    expect(selectors.selectShipmentSpecimenLastRemovedId(state)).toBe(shipmentSpecimen.id);
  });

  it('selectShipmentSpecimenSearchActive', () => {
    const state = {
      'shipment-specimen': {
        ...initialState,
        searchActive: true
      }
    };

    expect(selectors.selectShipmentSpecimenSearchActive(state)).toBeTruthy();
  });

  it('selectShipmentSpecimenLastSearch', () => {
    const searchParams = new SearchParams();
    const state = {
      'shipment-specimen': {
        ...initialState,
        lastSearch: searchParams
      }
    };

    expect(selectors.selectShipmentSpecimenLastSearch(state)).toBe(searchParams);
  });

  it('selectShipmentSpecimenSearchReplies', () => {
    const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
    const pagedReply = factory.pagedReply<ShipmentSpecimen>([ shipmentSpecimen ]);
    const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
    searchReplies[pagedReply.searchParams.queryString()] = {
      searchParams: pagedReply.searchParams,
      offset: pagedReply.offset,
      total: pagedReply.total,
      entityIds: pagedReply.entities.map(e => e.id),
      maxPages: pagedReply.maxPages,
    };
    const state = {
      'shipment-specimen': {
        ...initialState,
        searchReplies
      }
    };

    expect(selectors.selectShipmentSpecimenSearchReplies(state)).toBe(searchReplies);
  });

  it('selectAllShipmentSpecimens', () => {
    const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
    const adapter: EntityAdapter<ShipmentSpecimen> = createEntityAdapter<ShipmentSpecimen>({
      selectId: (s: ShipmentSpecimen) => s.id
    });
    const state = {
      'shipment-specimen': adapter.addAll([ shipmentSpecimen ], initialState)
    };

    expect(selectors.selectAllShipmentSpecimens(state)).toEqual([ shipmentSpecimen ]);
  });

  describe('selectShipmentSpecimenSearchRepliesAndEntities', () => {

    it('when search has completed', () => {
      const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      const adapter: EntityAdapter<ShipmentSpecimen> = createEntityAdapter<ShipmentSpecimen>({
        selectId: (s: ShipmentSpecimen) => s.id
      });
      const pagedReply = factory.pagedReply<ShipmentSpecimen>([ shipmentSpecimen ]);
      const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
      searchReplies[pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        entityIds: pagedReply.entities.map(e => e.id),
        maxPages: pagedReply.maxPages
      };
      const state = {
        'shipment-specimen': adapter.addAll([ shipmentSpecimen ], {
          ...initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies
        })
      };

      expect(selectors.selectShipmentSpecimenSearchRepliesAndEntities(state)).toEqual({
        entities: [ shipmentSpecimen ],
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
        'shipment-specimen': {
          ...initialState,
          searchActive: false,
          lastSearch: null
        }
      };

      expect(selectors.selectShipmentSpecimenSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when reply is missing', () => {
      const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      const adapter: EntityAdapter<ShipmentSpecimen> = createEntityAdapter<ShipmentSpecimen>({
        selectId: (s: ShipmentSpecimen) => s.id
      });
      const pagedReply = factory.pagedReply<ShipmentSpecimen>([ shipmentSpecimen ]);
      const state = {
        'shipment-specimen': adapter.addAll([ shipmentSpecimen ], {
          ...initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies: {}
        })
      };

      expect(selectors.selectShipmentSpecimenSearchRepliesAndEntities(state)).toBeUndefined();
    });

  });

});
