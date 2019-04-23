import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Specimen, CollectionEvent } from '@app/domain/participants';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import '@test/matchers/server-api.matchers';
import { SpecimenService } from './specimen.service';

describe('SpecimenService', () => {

  const BASE_URL = '/api/participants/cevents/spcs';

  let httpMock: HttpTestingController;
  let service: SpecimenService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [SpecimenService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(SpecimenService);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when requesting a specimen', () => {

    it('reply is handled correctly', () => {
      const { rawSpecimen, specimen, event } = createEntities();
      const obs = service.get(specimen.id).subscribe(s => {
        expect(s).toEqual(jasmine.any(Specimen));
      });
      expect(obs).toBeHttpSuccess(httpMock, 'GET', `${BASE_URL}/${specimen.id}`, rawSpecimen);
    });

    it('handles an error reply correctly', () => {
      const { rawSpecimen, specimen, event } = createEntities();
      const obs = service.get(specimen.id);
      expect(obs).toBeHttpError(httpMock,
                                'GET',
                                `${BASE_URL}/${specimen.id}`,
                                'expected a specimen object');
    });

  });

  describe('when searching specimens', () => {
    let reply: any;

    beforeEach(() => {
      const { rawSpecimen, specimen, event } = createEntities();
      reply = {
        items: [ rawSpecimen ],
        page: 1,
        limit: 10,
        offset: 0,
        total: 1
      };
    });

    it('can retrieve specimens', () => {
      const params = new SearchParams();
      service.search(params).subscribe((pr: PagedReply<Specimen>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Specimen));
        expect(pr.offset).toBe(reply.offset);
        expect(pr.total).toBe(reply.total);
      });

      const req = httpMock.expectOne(r => r.url === `${BASE_URL}/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({ status: 'success', data: reply });
      httpMock.verify();
    });

    describe('uses valid query parameters', function () {

      const context: PagedQueryBehaviour.Context<Specimen> = {};

      beforeEach(() => {
        context.search = (searchParams: SearchParams) => service.search(searchParams);
        context.url = `${BASE_URL}/list`;
        context.reply = reply;
      });

      PagedQueryBehaviour.sharedBehaviour(context);

    });

    it('handles an error reply correctly', () => {
      const params = new SearchParams();
      const obs = service.search(params);
      expect(obs).toBeHttpError(httpMock, 'GET', `${BASE_URL}/list`, 'expected a paged reply');
    });

  });

  describe('when adding a collection specimen', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const { rawSpecimen, specimen, event } = createEntities();
      const specimens = [ specimen ] ;
      const obs = service.add(event, specimens);
      obs.subscribe(s => {
        expect(s).toEqual(jasmine.any(Specimen));
        expect(s).toEqual(specimen);
      });

      expect(obs).toBeHttpSuccess(httpMock, 'POST', `${BASE_URL}/`, rawSpecimen, (body: any) => {
        expect(body).toEqual({
          collectionEventId: event.id,
          specimenData: specimens.map(spc => ({
            inventoryId:          spc.inventoryId,
            specimenDefinitionId: spc.specimenDefinitionId,
            timeCreated:          spc.timeCreated,
            amount:               spc.amount
          }))
        });
      });
    });

    it('handles an error reply correctly', () => {
      const { rawSpecimen, specimen, event } = createEntities();
      expect(service.add(event, [ specimen ]))
        .toBeHttpError(httpMock, 'POST', `${BASE_URL}/`, 'expected a specimen object');
    });

  });

  describe('for removing a specimen', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawSpecimen = factory.specimen();
      const specimen = new Specimen().deserialize(rawSpecimen);

      const obs = service.remove(specimen);
      obs.subscribe(id => {
        expect(id).toEqual(specimen.id);
      });

      const url = `${BASE_URL}/${specimen.id}/${specimen.version}`;
      expect(obs).toBeHttpSuccess(httpMock, 'DELETE', url, true);
    });

    it('handles an error reply correctly', () => {
      const rawSpecimen = factory.specimen();
      const specimen = new Specimen().deserialize(rawSpecimen);
      const url = `${BASE_URL}/${specimen.id}/${specimen.version}`;
      expect(service.remove(specimen))
        .toBeHttpError(httpMock, 'DELETE', url, 'expected a specimen object');
    });

  });

  function createEntities() {
    const rawSpecimen = factory.specimen();
    const specimen = new Specimen().deserialize(rawSpecimen);
    const event = new CollectionEvent().deserialize(factory.collectionEvent());
    return { rawSpecimen, specimen, event };
  }

});
