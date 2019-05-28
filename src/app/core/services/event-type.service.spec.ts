import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { CollectionEventType, Study } from '@app/domain/studies';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { EventTypeService } from '.';
import '@test/matchers/server-api.matchers';

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

    const context: PagedQueryBehaviour.Context<CollectionEventType> = {};

    beforeEach(() => {
      context.search = (searchParams: SearchParams) => service.search(study.slug, searchParams);
      context.url = `${BASE_URL}/${study.slug}`;
      context.replyItems = [ factory.collectionEventType() ];
      context.subscription = (pr: PagedReply<CollectionEventType>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(CollectionEventType));
      };
    });

    PagedQueryBehaviour.sharedBehaviour(context);

  });

  describe('when requesting an event type', () => {

    describe('using a SLUG', () => {

      it('reply is handled correctly', () => {
        const { rawAnnotationType, rawEventType, eventType } = createEntities();
        const obs = service.get(study.slug, eventType.slug);
        obs.subscribe(et => {
          expect(et).toEqual(jasmine.any(CollectionEventType));
        });
        expect(obs).toBeHttpSuccess(httpMock,
                                    'GET',
                                    `${BASE_URL}/${study.slug}/${eventType.slug}`,
                                    rawEventType);
      });

      it('handles an error reply correctly', () => {
        const { rawAnnotationType, rawEventType, eventType } = createEntities();
        const obs = service.get(study.slug, eventType.slug);
        expect(obs).toBeHttpError(httpMock,
                                  'GET',
                                  `${BASE_URL}/${study.slug}/${eventType.slug}`,
                                  'should have been an error response');
      });

    });

    describe('using an ID', () => {

      it('reply is handled correctly', () => {
        const { rawAnnotationType, rawEventType, eventType } = createEntities();
        const obs = service.getById(study.id, eventType.id);
        obs.subscribe(et => {
          expect(et).toEqual(jasmine.any(CollectionEventType));
        });
        expect(obs).toBeHttpSuccess(httpMock,
                                    'GET',
                                    `${BASE_URL}/id/${study.id}/${eventType.id}`,
                                    rawEventType);
      });

      it('handles an error reply correctly', () => {
        const { rawAnnotationType, rawEventType, eventType } = createEntities();
        const obs = service.getById(study.id, eventType.id);
        expect(obs).toBeHttpError(httpMock,
                                  'GET',
                                  `${BASE_URL}/id/${study.id}/${eventType.id}`,
                                  'should have been an error response');
      });

    });

  });

  describe('when querying for the collected specimen definition names', () => {

    it('reply is handled correctly', () => {
      const { rawAnnotationType, rawEventType, eventType } = createEntities();
      const specimenDefinitionNames = factory.collectedSpecimenDefinitionNames([ rawEventType ]);
      const obs = service.getSpecimenDefinitionNames(study.id);
      obs.subscribe(et => {
        expect(et).toEqual(jasmine.any(CollectionEventType));
      });
      expect(obs).toBeHttpSuccess(httpMock,
                                  'GET',
                                  `${BASE_URL}/spcdefs/${study.id}`,
                                  specimenDefinitionNames);
    });

    it('handles an error reply correctly', () => {
      const { rawAnnotationType, rawEventType, eventType } = createEntities();
      const obs = service.getSpecimenDefinitionNames(study.id);
      expect(obs).toBeHttpError(httpMock,
                                'GET',
                                `${BASE_URL}/spcdefs/${study.id}`,
                                'expected a collected specimen definition names array');
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

        service.update(eventType, 'addOrUpdateAnnotationType', eventType.annotationTypes[0]).subscribe(s => {
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

        service.update(eventType, 'addOrUpdateAnnotationType', eventType.annotationTypes[0]).subscribe(
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

      service.update(eventType, 'removeAnnotationType', eventType.annotationTypes[0].id).subscribe(s => {
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

      service.update(eventType, 'removeAnnotationType', eventType.annotationTypes[0].id).subscribe(
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

        service.update(eventType, 'addOrUpdateSpecimenDefinition', eventType.specimenDefinitions[0])
          .subscribe(s => {
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

        service.update(eventType, 'addOrUpdateSpecimenDefinition', eventType.specimenDefinitions[0]).subscribe(
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

      service.update(eventType, 'removeSpecimenDefinition', eventType.specimenDefinitions[0].id).subscribe(s => {
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

      service.update(eventType, 'removeSpecimenDefinition', eventType.specimenDefinitions[0].id).subscribe(
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
        err => { expect(err.message).toContain('expected an event type object'); }
      );

      const url = `${BASE_URL}/${eventType.studyId}/${eventType.id}/${eventType.version}`;
      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  function createEntities() {
    const rawAnnotationType = factory.annotationType();
    const rawEventType = factory.collectionEventType({ annotationTypes: [rawAnnotationType] });
    const eventType = new CollectionEventType().deserialize(rawEventType);

    return { rawAnnotationType, rawEventType, eventType };
  }

});
