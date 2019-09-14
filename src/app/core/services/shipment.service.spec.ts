import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Shipment, ShipmentState, ShipmentItemState, IShipment } from '@app/domain/shipments';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import '@test/matchers/server-api.matchers';
import { ShipmentService, ShipmentStateTransision } from './shipment.service';
import { Specimen } from '@app/domain/participants';
import { TestUtils } from '@test/utils';
import { Centre } from '@app/domain/centres';

describe('ShipmentService', () => {
  const BASE_URL = '/api/shipments';

  let httpMock: HttpTestingController;
  let service: ShipmentService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ShipmentService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(ShipmentService);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when requesting a shipment', () => {
    let rawShipment: any;
    let shipment: Shipment;

    beforeEach(() => {
      rawShipment = factory.shipment();
      shipment = new Shipment().deserialize(rawShipment);
    });

    it('reply is handled correctly', () => {
      const obs = service.get(shipment.id).subscribe(s => {
        expect(s).toEqual(jasmine.any(Shipment));
      });
      expect(obs).toBeHttpSuccess(httpMock, 'GET', `${BASE_URL}/${shipment.id}`, rawShipment);
    });

    it('handles an error reply correctly', () => {
      const obs = service.get(shipment.id);
      expect(obs).toBeHttpError(httpMock, 'GET', `${BASE_URL}/${shipment.id}`, 'expected a shipment object');
    });
  });

  describe('when searching shipments', () => {
    const context: PagedQueryBehaviour.Context<Shipment> = {};

    beforeEach(() => {
      context.search = (searchParams: SearchParams) => service.search(searchParams);
      context.url = `${BASE_URL}/list`;
      context.replyItems = [factory.shipment()];
      context.subscription = (pr: PagedReply<Shipment>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Shipment));
      };
    });

    PagedQueryBehaviour.sharedBehaviour(context);
  });

  describe('when adding a shipment', () => {
    it('request contains correct JSON and reply is handled correctly', () => {
      const rawShipment = factory.shipment();
      const shipment = new Shipment().deserialize(rawShipment);

      const obs = service.add(shipment);
      obs.subscribe(s => {
        expect(s).toEqual(jasmine.any(Shipment));
        expect(s).toEqual(shipment);
      });

      expect(obs).toBeHttpSuccess(httpMock, 'POST', `${BASE_URL}/`, rawShipment, (body: any) => {
        expect(body).toEqual({
          courierName: shipment.courierName,
          trackingNumber: shipment.trackingNumber,
          fromLocationId: shipment.fromLocationInfo.locationId,
          toLocationId: shipment.toLocationInfo.locationId
        });
      });
    });

    it('handles an error reply correctly', () => {
      const rawShipment = factory.shipment();
      const shipment = new Shipment().deserialize(rawShipment);
      expect(service.add(shipment)).toBeHttpError(
        httpMock,
        'POST',
        `${BASE_URL}/`,
        'expected a shipment object'
      );
    });
  });

  describe('for updating a shipment', () => {
    let rawShipment: IShipment;
    let shipment: Shipment;
    let testData: any;
    let centre: Centre;

    beforeEach(() => {
      rawShipment = factory.shipment();
      shipment = new Shipment().deserialize(rawShipment);
      centre = new Centre().deserialize(factory.centre({ locations: [factory.location()] }));
      const centreLocationInfo = factory.centreLocationInfo(centre);
      testData = [
        {
          shipment,
          attribute: 'courierName',
          value: factory.stringNext(),
          url: `${BASE_URL}/courier/${shipment.id}`
        },
        {
          shipment,
          attribute: 'trackingNumber',
          value: factory.stringNext(),
          url: `${BASE_URL}/trackingnumber/${shipment.id}`
        },
        {
          shipment,
          attribute: 'fromLocation',
          value: centreLocationInfo,
          url: `${BASE_URL}/fromlocation/${shipment.id}`,
          json: { locationId: centreLocationInfo.locationId }
        },
        {
          shipment,
          attribute: 'toLocation',
          value: centreLocationInfo,
          url: `${BASE_URL}/tolocation/${shipment.id}`,
          json: { locationId: centreLocationInfo.locationId }
        }
      ];

      Object.values(ShipmentStateTransision).forEach(transition => {
        let value: any = { transition };
        let json: any = {};
        if (transition !== ShipmentStateTransision.Created) {
          value = { ...value, datetime: new Date() };
          json = { datetime: value.datetime };
        }
        if (
          transition === ShipmentStateTransision.SkipToSent ||
          transition === ShipmentStateTransision.SkipToUnpacked
        ) {
          value = { ...value, skipDatetime: new Date() };

          if (transition === ShipmentStateTransision.SkipToSent) {
            json = { timePacked: value.datetime, timeSent: value.skipDatetime };
          } else {
            json = { timeReceived: value.datetime, timeUnpacked: value.skipDatetime };
          }
        }

        testData.push({
          shipment,
          attribute: 'state',
          value,
          url: `${BASE_URL}/state/${transition}/${shipment.id}`,
          json
        });
      });
    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        const obs = service.update(testInfo.shipment, testInfo.attribute, testInfo.value);
        obs.subscribe(s => {
          expect(s).toEqual(jasmine.any(Shipment));
          expect(s).toEqual(testInfo.shipment);
        });

        let expectedJson: any = { expectedVersion: shipment.version };

        if (testInfo.json) {
          expectedJson = { ...expectedJson, ...testInfo.json };
        } else {
          expectedJson[testInfo.attribute] = testInfo.value;
        }

        expect(obs).toBeHttpSuccess(httpMock, 'POST', testInfo.url, rawShipment, (body: any) => {
          expect(body).toEqual(expectedJson);
        });
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        const obs = service.update(shipment, testInfo.attribute, testInfo.value);
        expect(obs).toBeHttpError(httpMock, 'POST', testInfo.url, 'expected a shipment object');
      });
    });

    it('throws an exception for invalid input', () => {
      testData = [
        {
          attribute: factory.stringNext(),
          value: factory.stringNext(),
          url: `${BASE_URL}/name/${shipment.id}`,
          expectedErrMsg: /invalid attribute name/
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(shipment, testInfo.attribute, testInfo.value)).toThrowError(
          testInfo.expectedErrMsg
        );
      });
    });
  });

  describe('checking if a specimen can be added', () => {
    it('request contains correct JSON and reply is handled correctly', () => {
      const inventoryId = factory.stringNext();
      const obs = service.canAddSpecimen(inventoryId);
      obs.subscribe(s => {
        expect(s).toEqual(jasmine.any(Specimen));
      });

      expect(obs).toBeHttpSuccess(
        httpMock,
        'GET',
        `${BASE_URL}/specimens/canadd/${inventoryId}`,
        factory.specimen()
      );
    });

    it('handles an error reply correctly', () => {
      const inventoryId = factory.stringNext();
      expect(service.canAddSpecimen(inventoryId)).toBeHttpError(
        httpMock,
        'GET',
        `${BASE_URL}/specimens/canadd/${inventoryId}`,
        'expected a specimen object'
      );
    });
  });

  describe('when adding specimens', () => {
    describe('when they are not in a container', () => {
      it('request contains correct JSON and reply is handled correctly', () => {
        const { rawShipment, shipment, inventoryIds } = testEntities();
        const obs = service.addSpecimens(shipment, inventoryIds);
        obs.subscribe(s => {
          expect(s).toEqual(jasmine.any(Shipment));
        });

        expect(obs).toBeHttpSuccess(httpMock, 'POST', `${BASE_URL}/specimens/${shipment.id}`, rawShipment);
      });

      it('handles an error reply correctly', () => {
        const { rawShipment, shipment, inventoryIds } = testEntities();
        expect(service.addSpecimens(shipment, inventoryIds)).toBeHttpError(
          httpMock,
          'POST',
          `${BASE_URL}/specimens/${shipment.id}`,
          'expected a shipment object'
        );
      });
    });
  });

  describe('when tagging specimens', () => {
    let apiData: any[];

    beforeEach(() => {
      apiData = Object.values(ShipmentItemState).map(specimenState => {
        const capitalized = TestUtils.capitalizeFirstLetter(specimenState);
        const methodName = `tagSpecimensAs${capitalized}`;
        return { specimenState, methodName };
      });
    });

    it('request contains correct JSON and reply is handled correctly', () => {
      const { rawShipment, shipment, inventoryIds } = testEntities();
      apiData.forEach(({ specimenState, methodName }) => {
        const obs = service[methodName](shipment, inventoryIds);
        obs.subscribe(s => {
          expect(s).toEqual(jasmine.any(Shipment));
        });

        expect(obs).toBeHttpSuccess(
          httpMock,
          'POST',
          `${BASE_URL}/specimens/${specimenState}/${shipment.id}`,
          rawShipment
        );
      });
    });

    it('handles an error reply correctly', () => {
      const { rawShipment, shipment, inventoryIds } = testEntities();
      apiData.forEach(({ specimenState, methodName }) => {
        expect(service[methodName](shipment, inventoryIds)).toBeHttpError(
          httpMock,
          'POST',
          `${BASE_URL}/specimens/${specimenState}/${shipment.id}`,
          'expected a shipment object'
        );
      });
    });
  });

  describe('for removing a shipment', () => {
    it('request contains correct JSON and reply is handled correctly', () => {
      const rawShipment = factory.shipment();
      const shipment = new Shipment().deserialize(rawShipment);

      const obs = service.remove(shipment);
      obs.subscribe(id => {
        expect(id).toEqual(shipment.id);
      });

      const url = `${BASE_URL}/${shipment.id}/${shipment.version}`;
      expect(obs).toBeHttpSuccess(httpMock, 'DELETE', url, true);
    });

    it('handles an error reply correctly', () => {
      const rawShipment = factory.shipment();
      const shipment = new Shipment().deserialize(rawShipment);
      const url = `${BASE_URL}/${shipment.id}/${shipment.version}`;
      expect(service.remove(shipment)).toBeHttpError(httpMock, 'DELETE', url, 'expected a shipment object');
    });
  });

  function testEntities(): { rawShipment: any; shipment: Shipment; inventoryIds: string[] } {
    const rawShipment = factory.shipment();
    return {
      rawShipment,
      shipment: new Shipment().deserialize(rawShipment),
      inventoryIds: [factory.stringNext()]
    };
  }
});
