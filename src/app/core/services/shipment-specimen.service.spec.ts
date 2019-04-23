import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Specimen } from '@app/domain/participants';
import { Shipment, ShipmentItemState, ShipmentState, ShipmentSpecimen } from '@app/domain/shipments';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import '@test/matchers/server-api.matchers';
import { TestUtils } from '@test/utils';
import { ShipmentSpecimenService } from './shipment-specimen.service';
import { ShipmentService } from './shipment.service';

interface SpecimenInfo {
  rawSpecimen: any;
  specimen: Specimen;
  rawShipmentSpecimen: any;
  shipmentSpecimen: ShipmentSpecimen;
}

interface TestEntities {
  rawShipment?: any;
  shipment?: Shipment;
  specimenData?: SpecimenInfo[];
}

describe('shipment-specimens.Service', () => {

  const BASE_URL = '/api/shipments/specimens';

  let httpMock: HttpTestingController;
  let service: ShipmentSpecimenService;
  const factory = new Factory();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [ShipmentSpecimenService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(ShipmentSpecimenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when requesting a shipment specimen', () => {

    it('reply is handled correctly', () => {
      const { specimenData } = createEntities();
      const shipmentSpecimen = specimenData[0].shipmentSpecimen;
      const obs = service.get(shipmentSpecimen.id).subscribe(s => {
        expect(s).toEqual(jasmine.any(ShipmentSpecimen));
      });
      expect(obs).toBeHttpSuccess(httpMock,
                                  'GET',
                                  `${BASE_URL}/${shipmentSpecimen.id}`,
                                  specimenData[0].rawShipmentSpecimen);
    });

    it('handles an error reply correctly', () => {
      const { rawShipment, shipment, specimenData } = createEntities();
      const shipmentSpecimen = specimenData[0].shipmentSpecimen;
      const obs = service.get(shipmentSpecimen.id);
      expect(obs).toBeHttpError(httpMock,
                                'GET',
                                `${BASE_URL}/${shipmentSpecimen.id}`,
                                'expected a shipment specimen object');
    });

  });

  describe('when searching shipment specimens', () => {
    let rawShipment: any;
    let reply: any;

    beforeEach(() => {
      rawShipment = factory.shipment();
      reply = {
        items: [ rawShipment ],
        page: 1,
        limit: 10,
        offset: 0,
        total: 1
      };
    });

    it('can retrieve shipments', () => {
      const { shipment } = createEntities();
      const params = new SearchParams();
      service.search(shipment, params).subscribe((pr: PagedReply<ShipmentSpecimen>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Shipment));
        expect(pr.offset).toBe(reply.offset);
        expect(pr.total).toBe(reply.total);
      });

      const req = httpMock.expectOne(r => r.url === `${BASE_URL}/${shipment.id}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({ status: 'success', data: reply });
      httpMock.verify();
    });

    describe('uses valid query parameters', function () {

      const context: PagedQueryBehaviour.Context<ShipmentSpecimen> = {};

      beforeEach(() => {
        const { shipment } = createEntities();
        context.search = (searchParams: SearchParams) => service.search(shipment, searchParams);
        context.url = `${BASE_URL}/${shipment.id}`;
        context.reply = reply;
      });

      PagedQueryBehaviour.sharedBehaviour(context);

    });

    it('handles an error reply correctly', () => {
      const { shipment } = createEntities();
      const params = new SearchParams();
      const obs = service.search(shipment, params);
      expect(obs).toBeHttpError(httpMock,
                                'GET',
                                `${BASE_URL}/${shipment.id}`,
                                'expected a paged reply');
    });

  });

  describe('for removing a shipment specimen', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const { specimenData } = createEntities();
      const shipmentSpecimen = specimenData[0].shipmentSpecimen;
      const obs = service.remove(shipmentSpecimen);
      obs.subscribe(id => {
        expect(id).toEqual(shipmentSpecimen.id);
      });

      /* tslint:disable-next-line:max-line-length */
      const url = `${BASE_URL}/${shipmentSpecimen.shipmentId}/${shipmentSpecimen.id}/${shipmentSpecimen.version}`;
      expect(obs).toBeHttpSuccess(httpMock, 'DELETE', url, true);
    });

    it('handles an error reply correctly', () => {
      const { specimenData } = createEntities();
      const shipmentSpecimen = specimenData[0].shipmentSpecimen;
      expect(service.remove(shipmentSpecimen)).toBeHttpError(
        httpMock,
        'DELETE',
        `${BASE_URL}/${shipmentSpecimen.shipmentId}/${shipmentSpecimen.id}/${shipmentSpecimen.version}`,
        'expected a shipment specimen object');
    });

  });

  function createEntities(): TestEntities {
    const rawShipment = factory.shipment();
    const rawSpecimen = factory.specimen();
    const rawShipmentSpecimen = factory.shipmentSpecimen();
    return {
      rawShipment,
      shipment: new Shipment().deserialize(rawShipment),
      specimenData: [
        {
          rawSpecimen,
          specimen: new Specimen().deserialize(rawSpecimen),
          rawShipmentSpecimen,
          shipmentSpecimen: new ShipmentSpecimen().deserialize(rawShipmentSpecimen)
        }
      ]
    };
  }

});
