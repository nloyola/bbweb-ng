import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed, flush, fakeAsync } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProcessingType, Study } from '@app/domain/studies';
import { ProcessingTypeStoreActions, ProcessingTypeStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { ProcessingTypeResolver } from './processing-type-resolver.service';

describe('ProcessingTypeResolver', () => {

  let ngZone: NgZone;
  let resolver: ProcessingTypeResolver;
  let store: Store<ProcessingTypeStoreReducer.State>;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'processing-type': ProcessingTypeStoreReducer.reducer
        })
      ]
    });

    ngZone = TestBed.get(NgZone);
    resolver = TestBed.get(ProcessingTypeResolver);
    store = TestBed.get(Store);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should return a processing type', () => {
    const study = new Study().deserialize(factory.study());
    const processingType = new ProcessingType().deserialize(factory.processingType());
    const route = createRoute(study, processingType);

    const action = new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType });
    store.dispatch(action);

    const expected = cold('(b|)', { b: processingType });
    expect(resolver.resolve(route, null)).toBeObservable(expected);
  });

  it('should handle an error response', () => {
    const study = new Study().deserialize(factory.study());
    const processingType = new ProcessingType().deserialize(factory.processingType());
    const route = createRoute(study, processingType);
    const error = {
      error: {
        message: 'simulated error'
      },
      status: 404
    };

    const action = new ProcessingTypeStoreActions.GetProcessingTypeFailure({ error });
    store.dispatch(action);

    // prevent reducer from clearing out the failure
    jest.spyOn(store, 'dispatch').mockReturnValue(null);

    const expected = cold('(b|)', {
      b: {
        actionType: ProcessingTypeStoreActions.ActionTypes.GetProcessingTypeFailure,
        error
      }
    });
    ngZone.run(() => {
      expect(resolver.resolve(route, null)).toBeObservable(expected);
    });
  });

  function createRoute(study: Study, processingType: ProcessingType) {
    const route = new ActivatedRouteSnapshot();

    Object.defineProperty(route,
                          'paramMap',
                          { get: () => convertToParamMap({ processingTypeSlug: processingType.slug })});
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
