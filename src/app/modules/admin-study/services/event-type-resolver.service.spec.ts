import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEventType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreReducer, RootStoreState, NgrxRuntimeChecks } from '@app/root-store';
import { Factory } from '@test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { EventTypeResolver } from './event-type-resolver.service';

describe('EventTypeResolver', () => {

  let ngZone: NgZone;
  let resolver: EventTypeResolver;
  let store: Store<RootStoreState.State>;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'event-type': EventTypeStoreReducer.reducer
          },
          NgrxRuntimeChecks)
      ]
    });

    ngZone = TestBed.get(NgZone);
    resolver = TestBed.get(EventTypeResolver);
    store = TestBed.get(Store);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should return a eventType', () => {
    const study = new Study().deserialize(factory.study());
    const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
    const route = createRoute(study, eventType);

    const action = EventTypeStoreActions.getEventTypeSuccess({ eventType });
    store.dispatch(action);

    const expected = cold('(b|)', { b: eventType });
    expect(resolver.resolve(route, null)).toBeObservable(expected);
  });

  it('should handle an error response', () => {
    const study = new Study().deserialize(factory.study());
    const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
    const route = createRoute(study, eventType);
    const error = {
      error: {
        message: 'simulated error'
      },
      status: 404
    };

    const action = EventTypeStoreActions.getEventTypeFailure({ error });
    store.dispatch(action);
    const expected = cold('(b|)', {
      b: {
        actionType: EventTypeStoreActions.getEventTypeFailure.type,
        error
      }
    });
    ngZone.run(() => {
      expect(resolver.resolve(route, null)).toBeObservable(expected);
    });
  });

  function createRoute(study: Study, eventType: CollectionEventType) {
    const route = new ActivatedRouteSnapshot();

    Object.defineProperty(route,
                          'paramMap',
                          { get: () => convertToParamMap({ eventTypeSlug: eventType.slug })});
    Object.defineProperty(route, 'parent', { get: () => ({
      parent: {
        parent: {
          paramMap: convertToParamMap({ slug: study.slug })
        }
      }
    })});
    return route;
  }

});
