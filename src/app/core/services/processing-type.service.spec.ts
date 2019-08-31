import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { ProcessingType, Study } from '@app/domain/studies';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import '@test/matchers/server-api.matchers';
import * as faker from 'faker';
import { ProcessingTypeService } from '.';

describe('ProcessingTypeService', () => {
  const BASE_URL = '/api/studies/proctypes';

  let httpMock: HttpTestingController;
  let service: ProcessingTypeService;
  let factory: Factory;
  let study: Study;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProcessingTypeService]
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
    const context: PagedQueryBehaviour.Context<ProcessingType> = {};

    beforeEach(() => {
      context.search = (searchParams: SearchParams) => service.search(study.slug, searchParams);
      context.url = `${BASE_URL}/${study.slug}`;
      context.replyItems = [factory.processingType()];
      context.subscription = (pr: PagedReply<ProcessingType>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(ProcessingType));
      };
    });

    PagedQueryBehaviour.sharedBehaviour(context);
  });

  describe('when requesting an event type', () => {
    describe('when using SLUG', () => {
      it('reply is handled correctly', () => {
        const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
        const obs = service.get(study.slug, processingType.slug);
        obs.subscribe(et => {
          expect(et).toEqual(jasmine.any(ProcessingType));
        });
        expect(obs).toBeHttpSuccess(
          httpMock,
          'GET',
          `${BASE_URL}/${study.slug}/${processingType.slug}`,
          rawProcessingType
        );
      });

      it('handles an error reply correctly', () => {
        const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
        const obs = service.get(study.slug, processingType.slug);
        expect(obs).toBeHttpError(
          httpMock,
          'GET',
          `${BASE_URL}/${study.slug}/${processingType.slug}`,
          'should have been an error response'
        );
      });
    });

    describe('when using ID', () => {
      it('reply is handled correctly', () => {
        const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
        const obs = service.getById(study.id, processingType.id);
        obs.subscribe(et => {
          expect(et).toEqual(jasmine.any(ProcessingType));
        });
        expect(obs).toBeHttpSuccess(
          httpMock,
          'GET',
          `${BASE_URL}/id/${study.id}/${processingType.id}`,
          rawProcessingType
        );
      });

      it('handles an error reply correctly', () => {
        const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
        const obs = service.getById(study.id, processingType.id);
        expect(obs).toBeHttpError(
          httpMock,
          'GET',
          `${BASE_URL}/id/${study.id}/${processingType.id}`,
          'should have been an error response'
        );
      });
    });
  });

  describe('when querying if it is in use', () => {
    it('reply is handled correctly', () => {
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      const obs = service.getInUse(processingType.slug);
      obs.subscribe(et => {
        expect(et).toEqual(jasmine.any(ProcessingType));
      });
      expect(obs).toBeHttpSuccess(
        httpMock,
        'GET',
        `${BASE_URL}/inuse/${processingType.slug}`,
        rawProcessingType
      );
    });

    it('handles an error reply correctly', () => {
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      const obs = service.getInUse(processingType.slug);
      expect(obs).toBeHttpError(
        httpMock,
        'GET',
        `${BASE_URL}/inuse/${processingType.slug}`,
        'should have been an error response'
      );
    });
  });

  describe('when querying for the processed specimen definition names', () => {
    it('reply is handled correctly', () => {
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      const specimenDefinitionNames = factory.processedSpecimenDefinitionNames([rawProcessingType]);
      const obs = service.getSpecimenDefinitionNames(study.id);
      obs.subscribe(et => {
        expect(et).toEqual(jasmine.any(ProcessingType));
      });
      expect(obs).toBeHttpSuccess(
        httpMock,
        'GET',
        `${BASE_URL}/spcdefs/${study.id}`,
        specimenDefinitionNames
      );
    });

    it('handles an error reply correctly', () => {
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      const obs = service.getSpecimenDefinitionNames(study.id);
      expect(obs).toBeHttpError(
        httpMock,
        'GET',
        `${BASE_URL}/spcdefs/${study.id}`,
        'expected a processed specimen definition names array'
      );
    });
  });

  describe('when adding an event type', () => {
    it('request contains correct JSON and reply is handled correctly', () => {
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
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
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      service.add(processingType).subscribe(
        () => {
          fail('should have been an error response');
        },
        err => {
          expect(err.message).toContain('expected a study object');
        }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${processingType.studyId}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });
  });

  describe('for updating an event type', () => {
    let testData;

    beforeEach(() => {
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      const url = `${BASE_URL}/update/${processingType.studyId}/${processingType.id}`;
      testData = [
        {
          rawAnnotationType,
          rawProcessingType,
          processingType,
          property: 'name',
          value: factory.stringNext(),
          url
        },
        {
          rawAnnotationType,
          rawProcessingType,
          processingType,
          property: 'description',
          value: faker.lorem.paragraph(),
          url
        },
        {
          rawAnnotationType,
          rawProcessingType,
          processingType,
          property: 'description',
          value: undefined,
          url
        },
        {
          rawAnnotationType,
          rawProcessingType,
          processingType,
          property: 'enabled',
          value: true,
          url
        },
        {
          rawAnnotationType,
          rawProcessingType,
          processingType,
          property: 'enabled',
          value: false,
          url
        }
      ];
    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(testInfo.processingType, testInfo.property, testInfo.value).subscribe(s => {
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
          expectedVersion: testInfo.processingType.version
        };

        const req = httpMock.expectOne(testInfo.url);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(expectedJson);
        req.flush({ status: 'success', data: testInfo.rawProcessingType });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach(testInfo => {
        service.update(testInfo.processingType, testInfo.property, testInfo.value).subscribe(
          () => {
            fail('should have been an error response');
          },
          err => {
            expect(err.message).toContain('expected a study object');
          }
        );

        const req = httpMock.expectOne(testInfo.url);
        req.flush({ status: 'error', data: undefined });
        httpMock.verify();
      });
    });

    it('throws an exception for invalid input', () => {
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      testData = [
        {
          rawAnnotationType,
          rawProcessingType,
          processingType,
          property: factory.stringNext(),
          value: factory.stringNext(),
          url: `${BASE_URL}/update/${study.id}`,
          expectedErrMsg: /invalid attribute name/
        }
      ];
      testData.forEach(testInfo => {
        expect(() => service.update(testInfo.processingType, testInfo.property, testInfo.value)).toThrowError(
          testInfo.expectedErrMsg
        );
      });
    });
  });

  describe('for adding or updating an annotation type', () => {
    it('request contains correct JSON and reply is handled correctly', () => {
      const annotationTypeIds = [null, factory.stringNext()];
      annotationTypeIds.forEach(annotationTypeId => {
        const rawAnnotationType = {
          ...factory.annotationType(),
          id: annotationTypeId
        };
        const rawProcessingType = factory.processingType({ annotationTypes: [rawAnnotationType] });
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
      const annotationTypeIds = [null, factory.stringNext()];
      annotationTypeIds.forEach(annotationTypeId => {
        const rawAnnotationType = {
          ...factory.annotationType(),
          id: annotationTypeId
        };
        const rawProcessingType = factory.processingType({ annotationTypes: [rawAnnotationType] });
        const processingType = new ProcessingType().deserialize(rawProcessingType);

        service.addOrUpdateAnnotationType(processingType, processingType.annotationTypes[0]).subscribe(
          () => {
            fail('should have been an error response');
          },
          err => {
            expect(err.message).toContain('expected a study object');
          }
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
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
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
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      service.removeAnnotationType(processingType, processingType.annotationTypes[0].id).subscribe(
        () => {
          fail('should have been an error response');
        },
        err => {
          expect(err.message).toContain('expected a study object');
        }
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
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
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
      const { rawAnnotationType, rawProcessingType, processingType } = createEntities();
      service.removeProcessingType(processingType).subscribe(
        () => {
          fail('should have been an error response');
        },
        err => {
          expect(err.message).toContain('expected a study object');
        }
      );

      const url = `${BASE_URL}/${processingType.studyId}/${processingType.id}/${processingType.version}`;
      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });
  });

  function createEntities() {
    const rawAnnotationType = factory.annotationType();
    const rawProcessingType = factory.processingType({ annotationTypes: [rawAnnotationType] });
    const processingType = new ProcessingType().deserialize(rawProcessingType);
    return {
      rawAnnotationType,
      rawProcessingType,
      processingType
    };
  }
});
