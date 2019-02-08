import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { CollectionEventType, Study } from '@app/domain/studies';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { EventTypeService } from '.';

describe('EventTypeService', () => {

  const BASE_URL = '/api/studies/cetypes';

  let httpMock: HttpTestingController;
  let service: EventTypeService;
  let factory: Factory;
  let study: Study;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [ EventTypeService ]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(EventTypeService);
    factory = new Factory();
    study = new Study().deserialize(factory.study());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when searching event types', () => {
    let rawEventType: any;
    let reply: any;

    beforeEach(() => {
      rawEventType = factory.collectionEventType();
      reply = {
        items: [ rawEventType ],
        page: 1,
        limit: 10,
        offset: 0,
        total: 1
      };
    });

    it('can retrieve studies', () => {
      const params = new SearchParams();
      service.search(study.slug, params).subscribe((pr: PagedReply<CollectionEventType>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(CollectionEventType));
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

      const context: PagedQueryBehaviour.Context<CollectionEventType> = {};

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
    let annotationType: any;
    let rawEventType: any;
    let eventType: CollectionEventType;

    beforeEach(() => {
      annotationType = factory.annotationType();
      rawEventType = factory.collectionEventType({ annotationTypes: [annotationType] });
      eventType = new CollectionEventType().deserialize(rawEventType);
    });

    it('reply is handled correctly', () => {
      service.get(study.slug, eventType.slug).subscribe(et => {
        expect(et).toEqual(jasmine.any(CollectionEventType));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}/${eventType.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawEventType });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.get(study.slug, eventType.slug).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}/${eventType.slug}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when adding an event type', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawEventType = factory.collectionEventType();
      const eventType = new CollectionEventType().deserialize(rawEventType);

      service.add(eventType).subscribe(s => {
        expect(s).toEqual(jasmine.any(CollectionEventType));
        expect(s).toEqual(eventType);
      });

      const req = httpMock.expectOne(`${BASE_URL}/${eventType.studyId}`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: eventType.name,
        description: eventType.description,
        recurring: eventType.recurring,
        studyId: eventType.studyId
      });
      req.flush({ status: 'success', data: rawEventType });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawEventType = factory.collectionEventType();
      const eventType = new CollectionEventType().deserialize(rawEventType);

      service.add(eventType).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${eventType.studyId}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for updating an event type', () => {

    let rawEventType: any;
    let eventType: CollectionEventType;
    let testData: any;

    beforeEach(() => {
      rawEventType = factory.collectionEventType();
      eventType = new CollectionEventType().deserialize(rawEventType);
      testData = [
        {
          attribute: 'name',
          value: factory.stringNext(),
          url: `${BASE_URL}/name/${eventType.id}`
        },
        {
          attribute: 'description',
          value: faker.lorem.paragraph(),
          url: `${BASE_URL}/description/${eventType.id}`
        },
        {
          attribute: 'description',
          value: undefined,
          url: `${BASE_URL}/description/${eventType.id}`
        },
        {
          attribute: 'recurring',
          value: true,
          url: `${BASE_URL}/recurring/${eventType.id}`
        },
        {
          attribute: 'recurring',
          value: false,
          url: `${BASE_URL}/recurring/${eventType.id}`
        }
      ];

    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(eventType, testInfo.attribute, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(Study));
          expect(s).toEqual(study);
        });

        const expectedJson = {
          studyId: eventType.studyId,
          expectedVersion: eventType.version
        };

        if (testInfo.attribute !== 'state') {
          expectedJson[testInfo.attribute] = testInfo.value;
        }

        const req = httpMock.expectOne(testInfo.url);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(expectedJson);
        req.flush({ status: 'success', data: rawEventType });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(eventType, testInfo.attribute, testInfo.value).subscribe(
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
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(eventType, testInfo.attribute, testInfo.value))
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
        const rawEventType = factory.collectionEventType({ annotationTypes: [ rawAnnotationType ]});
        const eventType = new CollectionEventType().deserialize(rawEventType);

        service.addOrUpdateAnnotationType(eventType, eventType.annotationTypes[0]).subscribe(s => {
          expect(s).toEqual(jasmine.any(CollectionEventType));
          expect(s).toEqual(eventType);
        });

        let url = `${BASE_URL}/annottype/${eventType.id}`;
        if (annotationTypeId !== null) {
          url += `/${annotationTypeId}`;
        }
        const req = httpMock.expectOne(url);

        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
          ...eventType.annotationTypes[0],
          studyId: eventType.studyId,
          expectedVersion: 0
        });
        req.flush({ status: 'success', data: rawEventType });
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
        const rawEventType = factory.collectionEventType({ annotationTypes: [ rawAnnotationType ]});
        const eventType = new CollectionEventType().deserialize(rawEventType);

        service.addOrUpdateAnnotationType(eventType, eventType.annotationTypes[0]).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a study object'); }
        );

        let url = `${BASE_URL}/annottype/${eventType.id}`;
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
      const rawEventType = factory.collectionEventType({ annotationTypes: [ rawAnnotationType ]});
      const eventType = new CollectionEventType().deserialize(rawEventType);

      service.removeAnnotationType(eventType, eventType.annotationTypes[0].id).subscribe(s => {
        expect(s).toEqual(jasmine.any(Study));
        expect(s).toEqual(study);
      });

      /* tslint:disable:max-line-length */
      const url = `${BASE_URL}/annottype/${eventType.studyId}/${eventType.id}/${eventType.version}/${rawAnnotationType.id}`;
      /* tslint:enable:max-line-length */

      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: rawEventType });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawAnnotationType = factory.annotationType();
      const rawEventType = factory.collectionEventType({ annotationTypes: [ rawAnnotationType ]});
      const eventType = new CollectionEventType().deserialize(rawEventType);

      service.removeAnnotationType(eventType, eventType.annotationTypes[0].id).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      /* tslint:disable:max-line-length */
      const url = `${BASE_URL}/annottype/${eventType.studyId}/${eventType.id}/${eventType.version}/${rawAnnotationType.id}`;
      /* tslint:enable:max-line-length */

      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for adding or updating an specimen definition', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const specimenDefinitionIds = [ null, factory.stringNext() ];
      specimenDefinitionIds.forEach(specimenDefinitionId => {
        const rawSpecimenDefinition = {
          ...factory.collectedSpecimenDefinition(),
          id: specimenDefinitionId
        };
        const rawEventType = factory.collectionEventType({ specimenDefinitions: [ rawSpecimenDefinition ]});
        const eventType = new CollectionEventType().deserialize(rawEventType);

        service.addOrUpdateSpecimenDefinition(eventType, eventType.specimenDefinitions[0]).subscribe(s => {
          expect(s).toEqual(jasmine.any(CollectionEventType));
          expect(s).toEqual(eventType);
        });

        let url = `${BASE_URL}/spcdef/${eventType.id}`;
        if (specimenDefinitionId !== null) {
          url += `/${specimenDefinitionId}`;
        }
        const req = httpMock.expectOne(url);

        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
          ...eventType.specimenDefinitions[0],
          studyId: eventType.studyId,
          expectedVersion: 0
        });
        req.flush({ status: 'success', data: rawEventType });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      const specimenDefinitionIds = [ null, factory.stringNext() ];
      specimenDefinitionIds.forEach(specimenDefinitionId => {
        const rawAnnotationType = {
          ...factory.collectedSpecimenDefinition(),
          id: specimenDefinitionId
        };
        const rawEventType = factory.collectionEventType({ specimenDefinitions: [ rawAnnotationType ]});
        const eventType = new CollectionEventType().deserialize(rawEventType);

        service.addOrUpdateSpecimenDefinition(eventType, eventType.specimenDefinitions[0]).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a study object'); }
        );

        let url = `${BASE_URL}/spcdef/${eventType.id}`;
        if (specimenDefinitionId !== null) {
          url += `/${specimenDefinitionId}`;
        }
        const req = httpMock.expectOne(url);
        req.flush({ status: 'error', data: undefined });
        httpMock.verify();
      });
    });

  });

  describe('for removing an specimen definition', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawSpecimenDefinition = factory.collectedSpecimenDefinition();
      const rawEventType = factory.collectionEventType({ specimenDefinitions: [ rawSpecimenDefinition ]});
      const eventType = new CollectionEventType().deserialize(rawEventType);

      service.removeSpecimenDefinition(eventType, eventType.specimenDefinitions[0].id).subscribe(s => {
        expect(s).toEqual(jasmine.any(CollectionEventType));
        expect(s).toEqual(eventType);
      });

      /* tslint:disable:max-line-length */
      const url = `${BASE_URL}/spcdef/${eventType.studyId}/${eventType.id}/${eventType.version}/${rawSpecimenDefinition.id}`;
      /* tslint:enable:max-line-length */

      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: rawEventType });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawSpecimenDefinition = factory.collectedSpecimenDefinition();
      const rawEventType = factory.collectionEventType({ specimenDefinitions: [ rawSpecimenDefinition ]});
      const eventType = new CollectionEventType().deserialize(rawEventType);

      service.removeSpecimenDefinition(eventType, eventType.specimenDefinitions[0].id).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      /* tslint:disable:max-line-length */
      const url = `${BASE_URL}/spcdef/${eventType.studyId}/${eventType.id}/${eventType.version}/${rawSpecimenDefinition.id}`;
      /* tslint:enable:max-line-length */


      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for removing an event type', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawEventType = factory.collectionEventType();
      const eventType = new CollectionEventType().deserialize(rawEventType);

      service.removeEventType(eventType).subscribe(id => {
        expect(id).toEqual(eventType.id);
      });

      const url = `${BASE_URL}/${eventType.studyId}/${eventType.id}/${eventType.version}`;
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: eventType.id });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawEventType = factory.collectionEventType();
      const eventType = new CollectionEventType().deserialize(rawEventType);

      service.removeEventType(eventType).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const url = `${BASE_URL}/${eventType.studyId}/${eventType.id}/${eventType.version}`;
      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

});
