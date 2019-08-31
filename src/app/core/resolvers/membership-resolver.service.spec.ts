import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Membership } from '@app/domain/access';
import {
  MembershipStoreActions,
  MembershipStoreReducer,
  NgrxRuntimeChecks,
  RootStoreState
} from '@app/root-store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { MembershipResolver } from './membership-resolver.service';

describe('MembershipResolver', () => {
  let ngZone: NgZone;
  let resolver: MembershipResolver;
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
            membership: MembershipStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ]
    });

    ngZone = TestBed.get(NgZone);
    resolver = TestBed.get(MembershipResolver);
    store = TestBed.get(Store);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should return a membership', () => {
    const membership = new Membership().deserialize(factory.membership());
    const route = new ActivatedRouteSnapshot();
    route.params = { slug: membership.slug };
    const action = MembershipStoreActions.getMembershipSuccess({ membership });
    store.dispatch(action);
    const expected = cold('(b|)', { b: membership });
    expect(resolver.resolve(route, null)).toBeObservable(expected);
  });

  it('should handle an error response', () => {
    const error = {
      error: {
        message: 'simulated error'
      },
      status: 404
    };
    const route = new ActivatedRouteSnapshot();
    route.params = { slug: 'test' };
    const action = MembershipStoreActions.getMembershipFailure({ error });
    store.dispatch(action);
    const expected = cold('(b|)', {
      b: {
        error,
        actionType: MembershipStoreActions.getMembershipFailure.type
      }
    });
    ngZone.run(() => {
      expect(resolver.resolve(route, null)).toBeObservable(expected);
    });
  });
});
