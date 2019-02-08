import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { ProcessingType, Study } from '@app/domain/studies';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { ProcessingTypeService } from '.';
import { AnnotationType } from '@app/domain/annotations';

describe('ProcessingTypeService', () => {

  const BASE_URL = '/api/studies/proctypes';

  let httpMock: HttpTestingController;
  let service: ProcessingTypeService;
  let factory: Factory;
  let study: Study;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [ ProcessingTypeService ]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(ProcessingTypeService);
    factory = new Factory();
    study = new Study().deserialize(factory.study());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when searching event types', () => {
    let rawProcessingType: any;
    let reply: any;

    beforeEach(() => {
      rawProcessingType = factory.processingType();
      reply = {
        items: [ rawProcessingType ],
        page: 1,
        limit: 10,
        offset: 0,
        total: 1
      };
    });

    it('can retrieve studies', () => {
      const params = new SearchParams();
      service.search(study.slug, params).subscribe((pr: PagedReply<ProcessingType>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(ProcessingType));
        expect(pr.offset).toBe(reply.offset);
        expect(pr.total).toBe(reply.total);
      });

      const req = httpMock.expectOne(r => r.url === `${BASE_URL}/${study.slug}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({
        status: 'success',
        data: reply
      });
      httpMock.verify();
    });

    describe('uses valid query parameters', function () {

      const context: PagedQueryBehaviour.Context<ProcessingType> = {};

      beforeEach(() => {
        context.search = (searchParams: SearchParams) => service.search(study.slug, searchParams);
        context.url = `${BASE_URL}/${study.slug}`;
        context.reply = reply;
      });

      PagedQueryBehaviour.sharedBehaviour(context);

    });

    it('handles an error reply correctly', () => {
      const params = new SearchParams();
      service.search(study.slug, params).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a paged reply'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when requesting an event type', () => {
    let annotationType: AnnotationType;
    let rawProcessingType: any;
    let processingType: ProcessingType;

    beforeEach(() => {
      annotationType = factory.annotationType();
      rawProcessingType = factory.processingType({ annotationTypes: [annotationType] });
      processingType = new ProcessingType().deserialize(rawProcessingType);
    });

    it('reply is handled correctly', () => {
      service.get(study.slug, processingType.slug).subscribe(et => {
        expect(et).toEqual(jasmine.any(ProcessingType));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}/${processingType.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawProcessingType });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.get(study.slug, processingType.slug).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}/${processingType.slug}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when adding an event type', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawProcessingType = factory.processingType();
      const processingType = new ProcessingType().deserialize(rawProcessingType);

      service.add(processingType).subscribe(s => {
        expect(s).toEqual(jasmine.any(ProcessingType));
        expect(s).toEqual(processingType);
      });

      const req = httpMock.expectOne(`${BASE_URL}/${processingType.studyId}`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: processingType.name,
        description: processingType.description,
        enabled: processingType.enabled,
        input: processingType.input,
        output: processingType.output
      });
      req.flush({ status: 'success', data: rawProcessingType });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawProcessingType = factory.processingType();
      const processingType = new ProcessingType().deserialize(rawProcessingType);

      service.add(processingType).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${processingType.studyId}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for updating an event type', () => {

    let rawProcessingType: any;
    let processingType: ProcessingType;
    let testData: any[];
    let url: string;

    beforeEach(() => {
      rawProcessingType = factory.processingType();
      processingType = new ProcessingType().deserialize(rawProcessingType);
      url = `${BASE_URL}/update/${processingType.studyId}/${processingType.id}`;
      testData = [
        {
          property: 'name',
          value: factory.stringNext()
        },
        {
          property: 'description',
          value: faker.lorem.paragraph()
        },
        {
          property: 'description',
          value: undefined
        },
        {
          property: 'enabled',
          value: true
        },
        {
          property: 'enabled',
          value: false
        }
      ];

    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(processingType, testInfo.property, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(Study));
          expect(s).toEqual(study);
        });

        let expectedValue = testInfo.value;
        if (testInfo.property === 'description') {
          expectedValue = !!testInfo.value ? testInfo.value : '';
        }

        const expectedJson = {
          property: testInfo.property,
          newValue: expectedValue,
          expectedVersion: processingType.version
        };

        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(expectedJson);
        req.flush({ status: 'success', data: rawProcessingType });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach(testInfo => {
        service.update(processingType, testInfo.property, testInfo.value).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a study object'); }
        );

        const req = httpMock.expectOne(url);
        req.flush({ status: 'error', data: undefined });
        httpMock.verify();
      });
    });

    it('throws an exception for invalid input', () => {
      testData = [
        {
          property: factory.stringNext(),
          value: factory.stringNext(),
          url: `${BASE_URL}/update/${study.id}`,
          expectedErrMsg: /invalid attribute name/
        }
      ];
      testData.forEach(testInfo => {
        expect(() => service.update(processingType, testInfo.property, testInfo.value))
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
        const rawProcessingType = factory.processingType({ annotationTypes: [ rawAnnotationType ]});
        const processingType = new ProcessingType().deserialize(rawProcessingType);

        service.addOrUpdateAnnotationType(processingType, processingType.annotationTypes[0]).subscribe(s => {
          expect(s).toEqual(jasmine.any(ProcessingType));
          expect(s).toEqual(processingType);
        });

        let url = `${BASE_URL}/annottype/${processingType.id}`;
        if (annotationTypeId !== null) {
          url += `/${annotationTypeId}`;
        }
        const req = httpMock.expectOne(url);

        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
          ...processingType.annotationTypes[0],
          studyId: processingType.studyId,
          expectedVersion: 0
        });
        req.flush({ status: 'success', data: rawProcessingType });
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
        const rawProcessingType = factory.processingType({ annotationTypes: [ rawAnnotationType ]});
        const processingType = new ProcessingType().deserialize(rawProcessingType);

        service.addOrUpdateAnnotationType(processingType, processingType.annotationTypes[0]).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a study object'); }
        );

        let url = `${BASE_URL}/annottype/${processingType.id}`;
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
      const rawProcessingType = factory.processingType({ annotationTypes: [ rawAnnotationType ]});
      const processingType = new ProcessingType().deserialize(rawProcessingType);

      service.removeAnnotationType(processingType, processingType.annotationTypes[0].id).subscribe(s => {
        expect(s).toEqual(jasmine.any(Study));
        expect(s).toEqual(study);
      });

      /* tslint:disable:max-line-length */
      const url = `${BASE_URL}/annottype/${processingType.studyId}/${processingType.id}/${processingType.version}/${rawAnnotationType.id}`;
      /* tslint:enable:max-line-length */

      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: rawProcessingType });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawAnnotationType = factory.annotationType();
      const rawProcessingType = factory.processingType({ annotationTypes: [ rawAnnotationType ]});
      const processingType = new ProcessingType().deserialize(rawProcessingType);

      service.removeAnnotationType(processingType, processingType.annotationTypes[0].id).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      /* tslint:disable:max-line-length */
      const url = `${BASE_URL}/annottype/${processingType.studyId}/${processingType.id}/${processingType.version}/${rawAnnotationType.id}`;
      /* tslint:enable:max-line-length */

      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for removing an event type', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawProcessingType = factory.processingType();
      const processingType = new ProcessingType().deserialize(rawProcessingType);

      service.removeProcessingType(processingType).subscribe(id => {
        expect(id).toEqual(processingType.id);
      });

      const url = `${BASE_URL}/${processingType.studyId}/${processingType.id}/${processingType.version}`;
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: processingType.id });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawProcessingType = factory.processingType();
      const processingType = new ProcessingType().deserialize(rawProcessingType);

      service.removeProcessingType(processingType).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const url = `${BASE_URL}/${processingType.studyId}/${processingType.id}/${processingType.version}`;
      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

});
