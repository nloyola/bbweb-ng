import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Centre, CentreCounts } from '@app/domain/centres';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { CentreService } from './centre.service';
import { Location } from '@app/domain';
import { Study, IStudy } from '@app/domain/studies';

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
      location = new Location().deserialize(factory.location());
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

    const context: PagedQueryBehaviour.Context<Centre> = {};

    beforeEach(() => {
      context.search = (searchParams: SearchParams) => service.search(searchParams);
      context.url = `${BASE_URL}/search`;
      context.replyItems = [ factory.centre() ];
      context.subscription = (pr: PagedReply<Centre>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Centre));
      };
    });

    PagedQueryBehaviour.sharedBehaviour(context);

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
    const study = factory.study();
    const location = new Location().deserialize(factory.location());
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
        },
        {
          attribute: 'studyAdd',
          value: study.id,
          url: `${BASE_URL}/studies/${centre.id}`
        },
        {
          attribute: 'studyRemove',
          value: study.id,
          url: `${BASE_URL}/studies/${centre.id}/${centre.version}/${study.id}`
        },
        {
          attribute: 'locationAdd',
          value: location,
          url: `${BASE_URL}/locations/${centre.id}/${location.id}`
        },
        {
          attribute: 'locationRemove',
          value: location,
          url: `${BASE_URL}/locations/${centre.id}/${centre.version}/${location.id}`
        }
      ];

    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(centre, testInfo.attribute, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(Centre));
          expect(s).toEqual(centre);
        });

        let expectedJson = { expectedVersion: centre.version };

        switch (testInfo.attribute) {
          case 'studyAdd':
            expectedJson['studyId'] = testInfo.value;
            break;

          case 'locationAdd':
            expectedJson = { ...expectedJson, ...location };
            break;

          case 'state':
            // empty on purpose
            break;

          default:
            expectedJson[testInfo.attribute] = testInfo.value;
        }

        const req = httpMock.expectOne(testInfo.url);

        if (['studyRemove', 'locationRemove'].includes(testInfo.attribute)) {
          expect(req.request.method).toBe('DELETE');
        } else {
          expect(req.request.method).toBe('POST');
          expect(req.request.body).toEqual(expectedJson);
        }
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

});
