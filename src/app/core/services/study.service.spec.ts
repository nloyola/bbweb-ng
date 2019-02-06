import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Study, StudyCounts } from '@app/domain/studies';
import { PagedQueryBehaviour } from '@app/test/behaviours/paged-query.behaviour';
import { Factory } from '@app/test/factory';
import * as faker from 'faker';
import { StudyService } from './study.service';
import { AnnotationType } from '@app/domain/annotations';

describe('StudyService', () => {

  const BASE_URL = '/api/studies';

  let httpMock: HttpTestingController;
  let service: StudyService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [StudyService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(StudyService);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('for study counts', () => {

    it('reply is handled correctly', () => {
      const counts = factory.studyCounts();
      service.counts().subscribe((s: StudyCounts) => {
        expect(s.total).toBe(counts.total);
        expect(s.enabledCount).toBe(counts.enabledCount);
        expect(s.disabledCount).toBe(counts.disabledCount);
        expect(s.retiredCount).toBe(counts.retiredCount);
      });

      const req = httpMock.expectOne(`${BASE_URL}/counts`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: counts });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.counts().subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/counts`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when requesting a study', () => {
    let annotationType: AnnotationType;
    let rawStudy: any;
    let study: Study;

    beforeEach(() => {
      annotationType = factory.annotationType();
      rawStudy = factory.study({ annotationTypes: [annotationType] });
      study = new Study().deserialize(rawStudy);
    });

    it('reply is handled correctly', () => {
      service.get(study.slug).subscribe(s => {
        expect(s).toEqual(jasmine.any(Study));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawStudy });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.get(study.slug).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when searching studies', () => {
    let rawStudy: any;
    let reply: any;

    beforeEach(() => {
      rawStudy = factory.study();
      reply = {
        items: [ rawStudy ],
        page: 1,
        limit: 10,
        offset: 0,
        total: 1
      };
    });

    it('can retrieve studies', () => {
      const params = new SearchParams();
      service.search(params).subscribe((pr: PagedReply<Study>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Study));
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

      const context: PagedQueryBehaviour.Context<Study> = {};

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

  describe('when adding a study', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawStudy = factory.study();
      const study = new Study().deserialize(rawStudy);

      service.add(study).subscribe(s => {
        expect(s).toEqual(jasmine.any(Study));
        expect(s).toEqual(study);
      });

      const req = httpMock.expectOne(`${BASE_URL}/`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: study.name,
        description: study.description
      });
      req.flush({ status: 'success', data: rawStudy });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawStudy = factory.study();
      const study = new Study().deserialize(rawStudy);

      service.add(study).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for updating a study', () => {

    let rawStudy: any;
    let study: Study;
    let testData: any;

    beforeEach(() => {
      rawStudy = factory.study();
      study = new Study().deserialize(rawStudy);
      testData = [
        {
          attribute: 'name',
          value: factory.stringNext(),
          url: `${BASE_URL}/name/${study.id}`
        },
        {
          attribute: 'description',
          value: faker.lorem.paragraph(),
          url: `${BASE_URL}/description/${study.id}`
        },
        {
          attribute: 'description',
          value: undefined,
          url: `${BASE_URL}/description/${study.id}`
        },
        {
          attribute: 'state',
          value: 'enable',
          url: `${BASE_URL}/enable/${study.id}`
        },
        {
          attribute: 'state',
          value: 'disable',
          url: `${BASE_URL}/disable/${study.id}`
        },
        {
          attribute: 'state',
          value: 'retire',
          url: `${BASE_URL}/retire/${study.id}`
        },
        {
          attribute: 'state',
          value: 'unretire',
          url: `${BASE_URL}/unretire/${study.id}`
        }
      ];

    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(study, testInfo.attribute, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(Study));
          expect(s).toEqual(study);
        });

        const expectedJson = {
          expectedVersion: study.version
        };

        if (testInfo.attribute !== 'state') {
          expectedJson[testInfo.attribute] = testInfo.value;
        }

        const req = httpMock.expectOne(testInfo.url);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(expectedJson);
        req.flush({ status: 'success', data: rawStudy });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(study, testInfo.attribute, testInfo.value).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a study object'); }
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
          url: `${BASE_URL}/name/${study.id}`,
          expectedErrMsg: /invalid attribute name/
        },
        {
          attribute: 'state',
          value: factory.stringNext(),
          url: `${BASE_URL}/unretire/${study.id}`,
          expectedErrMsg: /invalid state change/
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(study, testInfo.attribute, testInfo.value))
          .toThrowError(testInfo.expectedErrMsg);
      });
    });
  });

  describe('for adding or updating an annotation type', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const annotationTypeIds = [ null, factory.stringNext() ];
      annotationTypeIds.forEach(annotationTypeId => {
        const rawAnnotationType = {
          ...factory.annotationType(),
          id: annotationTypeId
        };
        const rawStudy = factory.study({ annotationTypes: [ rawAnnotationType ]});
        const study = new Study().deserialize(rawStudy);

        service.addOrUpdateAnnotationType(study, study.annotationTypes[0]).subscribe(s => {
          expect(s).toEqual(jasmine.any(Study));
          expect(s).toEqual(study);
        });

        let url = `${BASE_URL}/pannottype/${study.id}`;
        if (annotationTypeId !== null) {
          url += `/${annotationTypeId}`;
        }
        const req = httpMock.expectOne(url);

        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
          ...study.annotationTypes[0],
          expectedVersion: 0
        });
        req.flush({ status: 'success', data: rawStudy });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      const annotationTypeIds = [ null, factory.stringNext() ];
      annotationTypeIds.forEach(annotationTypeId => {
        const rawAnnotationType = {
          ...factory.annotationType(),
          id: annotationTypeId
        };
        const rawStudy = factory.study({ annotationTypes: [ rawAnnotationType ]});
        const study = new Study().deserialize(rawStudy);

        service.addOrUpdateAnnotationType(study, study.annotationTypes[0]).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a study object'); }
        );

        let url = `${BASE_URL}/pannottype/${study.id}`;
        if (annotationTypeId !== null) {
          url += `/${annotationTypeId}`;
        }
        const req = httpMock.expectOne(url);
        req.flush({ status: 'error', data: undefined });
        httpMock.verify();
      });
    });

  });

  describe('for removing an annotation type', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawAnnotationType = factory.annotationType();
      const rawStudy = factory.study({ annotationTypes: [ rawAnnotationType ]});
      const study = new Study().deserialize(rawStudy);

      service.removeAnnotationType(study, study.annotationTypes[0].id).subscribe(s => {
        expect(s).toEqual(jasmine.any(Study));
        expect(s).toEqual(study);
      });

      const url = `${BASE_URL}/pannottype/${study.id}/${study.version}/${rawAnnotationType.id}`;
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: rawStudy });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawAnnotationType = factory.annotationType();
      const rawStudy = factory.study({ annotationTypes: [ rawAnnotationType ]});
      const study = new Study().deserialize(rawStudy);

      service.removeAnnotationType(study, study.annotationTypes[0].id).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const url = `${BASE_URL}/pannottype/${study.id}/${study.version}/${rawAnnotationType.id}`;
      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when checking if a study can be enabled', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawStudy = factory.study();
      const study = new Study().deserialize(rawStudy);

      service.enableAllowed(study.id).subscribe(s => {
        expect(s.studyId).toEqual(study.id);
        expect(s.allowed).toEqual(true);
      });

      const req = httpMock.expectOne(`${BASE_URL}/enableAllowed/${study.id}`);

      expect(req.request.method).toBe('GET');
      req.flush({
        status: 'success',
        data: {
          studyId: study.id,
          allowed: true
        }
      });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawStudy = factory.study();
      const study = new Study().deserialize(rawStudy);

      service.enableAllowed(study.id).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/enableAllowed/${study.id}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

});
