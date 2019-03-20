import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Centre, CentreCounts } from '@app/domain/centres';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { CentreService } from './centre.service';
import { Location } from '@app/domain';
import { Study } from '@app/domain/studies';

describe('CentreService', () => {

  const BASE_URL = '/api/centres';

  let httpMock: HttpTestingController;
  let service: CentreService;
  const factory = new Factory();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [CentreService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(CentreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('for centre counts', () => {

    it('reply is handled correctly', () => {
      const counts = factory.centreCounts();
      service.counts().subscribe((s: CentreCounts) => {
        expect(s.total).toBe(counts.total);
        expect(s.enabledCount).toBe(counts.enabledCount);
        expect(s.disabledCount).toBe(counts.disabledCount);
      });

      const req = httpMock.expectOne(`${BASE_URL}/counts`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: counts });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.counts().subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a centre object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/counts`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when requesting a centre', () => {
    let location: Location;
    let rawCentre: any;
    let centre: Centre;

    beforeEach(() => {
      location = factory.location();
      rawCentre = factory.centre({ locations: [location] });
      centre = new Centre().deserialize(rawCentre);
    });

    it('reply is handled correctly', () => {
      service.get(centre.slug).subscribe(s => {
        expect(s).toEqual(jasmine.any(Centre));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${centre.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawCentre });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.get(centre.slug).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a centre object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${centre.slug}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when searching centres', () => {
    let rawCentre: any;
    let reply: any;

    beforeEach(() => {
      rawCentre = factory.centre();
      reply = {
        items: [ rawCentre ],
        page: 1,
        limit: 10,
        offset: 0,
        total: 1
      };
    });

    it('can retrieve centres', () => {
      const params = new SearchParams();
      service.search(params).subscribe((pr: PagedReply<Centre>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Centre));
        expect(pr.offset).toBe(reply.offset);
        expect(pr.total).toBe(reply.total);
      });

      const req = httpMock.expectOne(r => r.url === `${BASE_URL}/search`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({
        status: 'success',
        data: reply
      });
      httpMock.verify();
    });

    describe('uses valid query parameters', function () {

      const context: PagedQueryBehaviour.Context<Centre> = {};

      beforeEach(() => {
        context.search = (searchParams: SearchParams) => service.search(searchParams);
        context.url = `${BASE_URL}/search`;
        context.reply = reply;
      });

      PagedQueryBehaviour.sharedBehaviour(context);

    });

    it('handles an error reply correctly', () => {
      const params = new SearchParams();
      service.search(params).subscribe(
        u => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a paged reply'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/search`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when adding a centre', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawCentre = factory.centre();
      const centre = new Centre().deserialize(rawCentre);

      service.add(centre).subscribe(s => {
        expect(s).toEqual(jasmine.any(Centre));
        expect(s).toEqual(centre);
      });

      const req = httpMock.expectOne(`${BASE_URL}/`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: centre.name,
        description: centre.description
      });
      req.flush({ status: 'success', data: rawCentre });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawCentre = factory.centre();
      const centre = new Centre().deserialize(rawCentre);

      service.add(centre).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a centre object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for updating a centre', () => {

    let rawCentre: any;
    let centre: Centre;
    let testData: any;

    beforeEach(() => {
      rawCentre = factory.centre();
      centre = new Centre().deserialize(rawCentre);
      testData = [
        {
          attribute: 'name',
          value: factory.stringNext(),
          url: `${BASE_URL}/name/${centre.id}`
        },
        {
          attribute: 'description',
          value: faker.lorem.paragraph(),
          url: `${BASE_URL}/description/${centre.id}`
        },
        {
          attribute: 'description',
          value: undefined,
          url: `${BASE_URL}/description/${centre.id}`
        },
        {
          attribute: 'state',
          value: 'enable',
          url: `${BASE_URL}/enable/${centre.id}`
        },
        {
          attribute: 'state',
          value: 'disable',
          url: `${BASE_URL}/disable/${centre.id}`
        }
      ];

    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(centre, testInfo.attribute, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(Centre));
          expect(s).toEqual(centre);
        });

        const expectedJson = {
          expectedVersion: centre.version
        };

        if (testInfo.attribute !== 'state') {
          expectedJson[testInfo.attribute] = testInfo.value;
        }

        const req = httpMock.expectOne(testInfo.url);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(expectedJson);
        req.flush({ status: 'success', data: rawCentre });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(centre, testInfo.attribute, testInfo.value).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a centre object'); }
        );

        const req = httpMock.expectOne(testInfo.url);
        req.flush({ status: 'error', data: undefined });
        httpMock.verify();
      });
    });

    it('throws an exception for invalid input', () => {
      testData = [
        {
          attribute: factory.stringNext(),
          value: factory.stringNext(),
          url: `${BASE_URL}/name/${centre.id}`,
          expectedErrMsg: /invalid attribute name/
        },
        {
          attribute: 'state',
          value: factory.stringNext(),
          url: `${BASE_URL}/unretire/${centre.id}`,
          expectedErrMsg: /invalid state change/
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(centre, testInfo.attribute, testInfo.value))
          .toThrowError(testInfo.expectedErrMsg);
      });
    });
  });

  describe('for studies', () => {

    let centre: Centre;
    let study: Study;

    beforeEach(() => {
      study = new Study().deserialize(factory.study());
      centre = new Centre().deserialize(factory.centre());
    });

    it('can add a study', () => {
      service.addStudy(centre, study.id).subscribe(c => {
        expect(c).toEqual(jasmine.any(Centre));
      });

      const req = httpMock.expectOne(`${BASE_URL}/studies/${centre.id}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        studyId: study.id,
        expectedVersion: centre.version
      });
      req.flush({ status: 'success', data: centre });
      httpMock.verify();
    });

    it('can remove a study', () => {
      const studyName = factory.entityNameAndStateDto(study);
      const centreWithStudy = new Centre().deserialize({
        ...centre as any,
        studyNames: [ studyName ]
      });

      service.removeStudy(centreWithStudy, study.id).subscribe(c => {
        expect(c).toEqual(jasmine.any(Centre));
      });

      const req = httpMock.expectOne(`${BASE_URL}/studies/${centre.id}/${centre.version}/${study.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: centre });
      httpMock.verify();
    });

    it('should not add a study that centre is already associated with', function() {
      const studyName = factory.entityNameAndStateDto(study);
      const centreWithStudy = new Centre().deserialize({
        ...centre as any,
        studyNames: [ studyName ]
      });

      expect(() => {
        service.addStudy(centreWithStudy, study.id);
      }).toThrowError(/study ID already present/);
    });

    it('should not remove a study that does not exist', function() {
      expect(() => {
        service.removeStudy(centre, study.id);
      }).toThrowError(/study ID not present/);
    });

  });

  describe('for adding or updating a location', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const locationIds = [ null, factory.stringNext() ];
      locationIds.forEach(locationId => {
        const rawLocation = {
          ...factory.location(),
          id: locationId
        };
        const rawCentre = factory.centre({ locations: [ rawLocation ]});
        const centre = new Centre().deserialize(rawCentre);

        service.addOrUpdateLocation(centre, centre.locations[0]).subscribe(s => {
          expect(s).toEqual(jasmine.any(Centre));
          expect(s).toEqual(centre);
        });

        let url = `${BASE_URL}/locations/${centre.id}`;
        if (locationId !== null) {
          url += `/${locationId}`;
        }
        const req = httpMock.expectOne(url);

        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
          ...centre.locations[0],
          expectedVersion: 0
        });
        req.flush({ status: 'success', data: rawCentre });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      const locationIds = [ null, factory.stringNext() ];
      locationIds.forEach(locationId => {
        const rawLocation = {
          ...factory.location(),
          id: locationId
        };
        const rawCentre = factory.centre({ locations: [ rawLocation ]});
        const centre = new Centre().deserialize(rawCentre);

        service.addOrUpdateLocation(centre, centre.locations[0]).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a centre object'); }
        );

        let url = `${BASE_URL}/locations/${centre.id}`;
        if (locationId !== null) {
          url += `/${locationId}`;
        }
        const req = httpMock.expectOne(url);
        req.flush({ status: 'error', data: undefined });
        httpMock.verify();
      });
    });

  });

  describe('for removing a location', () => {

    let rawLocation: any;
    let rawCentre: any;
    let centre: Centre;

    beforeEach(() => {
      rawLocation = factory.location();
      rawCentre = factory.centre({ locations: [ rawLocation ]});
      centre = new Centre().deserialize(rawCentre);
    });

    it('request contains correct JSON and reply is handled correctly', () => {
      service.removeLocation(centre, centre.locations[0].id).subscribe(s => {
        expect(s).toEqual(jasmine.any(Centre));
        expect(s).toEqual(centre);
      });

      const url = `${BASE_URL}/locations/${centre.id}/${centre.version}/${rawLocation.id}`;
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: rawCentre });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.removeLocation(centre, centre.locations[0].id).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a centre object'); }
      );

      const url = `${BASE_URL}/locations/${centre.id}/${centre.version}/${rawLocation.id}`;
      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

    it('should not remove a location that does not exist', function() {
      expect(() => {
        service.removeLocation(centre, factory.stringNext());
      }).toThrowError(/location ID not present/);
    });

  });

});
