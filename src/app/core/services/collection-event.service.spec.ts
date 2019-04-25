import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { CollectionEvent, Participant } from '@app/domain/participants';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import '@test/matchers/server-api.matchers';
import { CollectionEventService } from './collection-event.service';

interface TestEntities {
  participant?: Participant;
  rawEvent?: any;
  event?: CollectionEvent;
}

describe('CollectionEventService', () => {

  const BASE_URL = '/api/participants/cevents';

  let httpMock: HttpTestingController;
  let service: CollectionEventService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [CollectionEventService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(CollectionEventService);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when requesting a collection event', () => {

    it('reply is handled correctly', () => {
      const { rawEvent, event } = createEntities();
      const obs = service.get(event.id).subscribe(s => {
        expect(s).toEqual(jasmine.any(CollectionEvent));
      });
      expect(obs).toBeHttpSuccess(httpMock, 'GET', `${BASE_URL}/${event.id}`, rawEvent);
    });

    it('handles an error reply correctly', () => {
      const { rawEvent, event } = createEntities();
      const obs = service.get(event.id);
      expect(obs).toBeHttpError(httpMock,
                                'GET',
                                `${BASE_URL}/${event.id}`,
                                'expected a collectionEvent object');
    });

  });

  describe('when searching collection events', () => {

    it('can retrieve collectionEvents', () => {
      const { participant, rawEvent } = createEntities();
      const params = new SearchParams();
      const reply = createPagedReply([ rawEvent ]);
      service.search(participant, params).subscribe((pr: PagedReply<CollectionEvent>) => {
        expect(pr.entities.length).toBe(reply.total);
        expect(pr.entities[0]).toEqual(jasmine.any(CollectionEvent));
        expect(pr.offset).toBe(reply.offset);
        expect(pr.total).toBe(reply.total);
      });

      const req = httpMock.expectOne(r => r.url === `${BASE_URL}/list/${participant.id}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({ status: 'success', data: reply });
      httpMock.verify();
    });

    describe('uses valid query parameters', function () {

      const context: PagedQueryBehaviour.Context<CollectionEvent> = {};

      beforeEach(() => {
        const { participant, rawEvent } = createEntities();
        const reply = createPagedReply([ rawEvent ]);
        context.search = (searchParams: SearchParams) => service.search(participant, searchParams);
        context.url = `${BASE_URL}/list/${participant.id}`;
        context.reply = reply;
      });

      PagedQueryBehaviour.sharedBehaviour(context);

    });

    it('handles an error reply correctly', () => {
      const { participant, rawEvent } = createEntities();
      const params = new SearchParams();
      const reply = createPagedReply([ rawEvent ]);
      const obs = service.search(participant, params);
      expect(obs).toBeHttpError(httpMock, 'GET', `${BASE_URL}/list/${participant.id}`, 'expected a paged reply');
    });

  });

  describe('when adding a collection event', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const { rawEvent, event } = createEntities();
      const obs = service.add(event);
      obs.subscribe(s => {
        expect(s).toEqual(jasmine.any(CollectionEvent));
        expect(s).toEqual(event);
      });

      expect(obs).toBeHttpSuccess(httpMock, 'POST', `${BASE_URL}/`, rawEvent, (body: any) => {
        expect(body).toEqual({
          participantId:         event.participantId,
          collectionEventTypeId: event.eventTypeId,
          visitNumber:           event.visitNumber,
          timeCompleted:         event.timeCompleted,
          annotations:           event.annotations
        });
      });
    });

    it('handles an error reply correctly', () => {
      const rawCollectionEvent = factory.collectionEvent();
      const collectionEvent = new CollectionEvent().deserialize(rawCollectionEvent);
      expect(service.add(collectionEvent))
        .toBeHttpError(httpMock, 'POST', `${BASE_URL}/`, 'expected a collectionEvent object');
    });

  });

  describe('for updating a collection event', () => {

    let testData: any;

    beforeEach(() => {
      const annotationType = factory.annotationType();
      const annotation = factory.annotation({}, annotationType);
      const { rawEvent, event } = createEntities();
      testData = [
        {
          rawEvent,
          event,
          attribute: 'visitNumber',
          value: 1,
          url: `${BASE_URL}/visitNumber/${event.id}`
        },
        {
          rawEvent,
          event,
          attribute: 'timeCompleted',
          value: 1,
          url: `${BASE_URL}/timeCompleted/${event.id}`
        },
        {
          rawEvent,
          event,
          attribute: 'addAnnotation',
          value: event.annotations[0],
          url: `${BASE_URL}/annot/${event.id}`
        },
        {
          rawEvent,
          event,
          attribute: 'removeAnnotation',
          value: annotation.annotationTypeId,
          method: 'DELETE',
          url: `${BASE_URL}/annot/${event.id}/${event.version}/${annotation.annotationTypeId}`
        }
      ];
    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        const obs = service.update(testInfo.event, testInfo.attribute, testInfo.value);
        obs.subscribe(s => {
          expect(s).toEqual(jasmine.any(CollectionEvent));
          expect(s).toEqual(testInfo.event);
        });

        let expectedJson: any = { expectedVersion: testInfo.event.version };

        if (testInfo.json) {
          expectedJson = { ...expectedJson, ...testInfo.json };
        } else {
          expectedJson[testInfo.attribute] = testInfo.value;
        }

        if (testInfo.method && (testInfo.method === 'DELETE')) {
          expect(obs).toBeHttpSuccess(httpMock, 'DELETE', testInfo.url, true, (body: any) => {
            expect(body).toBeNull();
          });
        } else {
          expect(obs).toBeHttpSuccess(httpMock, 'POST', testInfo.url, testInfo.rawEvent, (body: any) => {
            expect(body).toEqual(expectedJson);
          });
        }
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        const obs = service.update(testInfo.event, testInfo.attribute, testInfo.value);
        if (testInfo.method && (testInfo.method === 'DELETE')) {
          expect(obs).toBeHttpError(httpMock, 'DELETE', testInfo.url, 'expected a collectionEvent object');
        } else {
          expect(obs).toBeHttpError(httpMock, 'POST', testInfo.url, 'expected a collectionEvent object');
        }
      });
    });

    it('throws an exception for invalid input', () => {
      const { rawEvent, event } = createEntities();
      testData = [
        {
          event: undefined,
          attribute: factory.stringNext(),
          value: factory.stringNext(),
          url: factory.stringNext(),
          expectedErrMsg: /collection event is undefined/
        },
        {
          event,
          attribute: factory.stringNext(),
          value: factory.stringNext(),
          url: factory.stringNext(),
          expectedErrMsg: /invalid attribute name/
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(testInfo.event, testInfo.attribute, testInfo.value))
          .toThrowError(testInfo.expectedErrMsg);
      });
    });
  });

  describe('for removing a collectionEvent', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawCollectionEvent = factory.collectionEvent();
      const collectionEvent = new CollectionEvent().deserialize(rawCollectionEvent);

      const obs = service.remove(collectionEvent);
      obs.subscribe(id => {
        expect(id).toEqual(collectionEvent.id);
      });

      const url = `${BASE_URL}/${collectionEvent.id}/${collectionEvent.version}`;
      expect(obs).toBeHttpSuccess(httpMock, 'DELETE', url, true);
    });

    it('handles an error reply correctly', () => {
      const rawCollectionEvent = factory.collectionEvent();
      const collectionEvent = new CollectionEvent().deserialize(rawCollectionEvent);
      const url = `${BASE_URL}/${collectionEvent.id}/${collectionEvent.version}`;
      expect(service.remove(collectionEvent))
        .toBeHttpError(httpMock, 'DELETE', url, 'expected a collectionEvent object');
    });

  });

  function createEntities() {
    const participant = new Participant().deserialize(factory.participant());
    const rawEvent = factory.collectionEvent();
    const event = new CollectionEvent().deserialize(rawEvent);
    return { participant, rawEvent, event };
  }

  function createPagedReply(rawEvent: any[]): any {
    return {
      items: [ rawEvent ],
      page: 1,
      limit: 10,
      offset: 0,
      total: 1
    };
  }

});
