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
      const { event } = createEntities();
      const obs = service.get(event.id);
      expect(obs).toBeHttpError(httpMock,
                                'GET',
                                `${BASE_URL}/${event.id}`,
                                'expected a collectionEvent object');
    });

  });

  describe('when searching collection events', () => {

    const context: PagedQueryBehaviour.Context<CollectionEvent> = {};

    beforeEach(() => {
      const { participant, rawEvent } = createEntities();
      context.search = (searchParams: SearchParams) => service.search(participant, searchParams);
      context.url = `${BASE_URL}/list/${participant.id}`;
      context.replyItems = [ rawEvent  ];
      context.subscription = (pr: PagedReply<CollectionEvent>) => {
        expect(pr.entities.length).toBe(context.replyItems.length);
        expect(pr.entities[0]).toEqual(jasmine.any(CollectionEvent));
      };
    });

    PagedQueryBehaviour.sharedBehaviour(context);

  });

  describe('when adding a collection event', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const { rawEvent, event } = createEntities();
      const obs = service.add(event);
      obs.subscribe(s => {
        expect(s).toEqual(jasmine.any(CollectionEvent));
        expect(s).toEqual(event);
      });

      expect(obs).toBeHttpSuccess(
        httpMock,
        'POST',
        `${BASE_URL}/${event.participantId}`,
        rawEvent,
        (body: any) => {
          expect(body).toEqual({
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
        .toBeHttpError(httpMock,
                       'POST',
                       `${BASE_URL}/${collectionEvent.participantId}`,
                       'expected a collectionEvent object');
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
          attribute: 'addOrUpdateAnnotation',
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
      const { event } = createEntities();
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

      /* tslint:disable-next-line:max-line-length */
      const url = `${BASE_URL}/${collectionEvent.participantId}/${collectionEvent.id}/${collectionEvent.version}`;
      expect(obs).toBeHttpSuccess(httpMock, 'DELETE', url, true);
    });

    it('handles an error reply correctly', () => {
      const rawCollectionEvent = factory.collectionEvent();
      const collectionEvent = new CollectionEvent().deserialize(rawCollectionEvent);

      /* tslint:disable-next-line:max-line-length */
      const url = `${BASE_URL}/${collectionEvent.participantId}/${collectionEvent.id}/${collectionEvent.version}`;
      expect(service.remove(collectionEvent))
        .toBeHttpError(httpMock, 'DELETE', url, 'expected a collectionEvent object');
    });

  });

  function createEntities(): TestEntities {
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
