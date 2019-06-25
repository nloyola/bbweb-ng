import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MembershipService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { MembershipStoreActions } from '@app/root-store';
import { Factory } from '@test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { MembershipStoreEffects } from './membership.effects';
import { Membership } from '@app/domain/access';
import { Action } from '@ngrx/store';

describe('membership-store effects', () => {

  let effects: MembershipStoreEffects;
  let actions: Observable<any>;
  let membershipService: MembershipService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        MembershipStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(MembershipStoreEffects);
    membershipService = TestBed.get(MembershipService);
    factory = new Factory();
  });

  describe('searchMembershipsRequestEffect', () => {

    it('should respond with success', () => {
      const searchParams = new SearchParams();
      const membership = new Membership().deserialize(factory.membership());
      const pagedReply = factory.pagedReply([ membership ]);
      const action = MembershipStoreActions.searchMembershipsRequest({ searchParams });
      const completion = MembershipStoreActions.searchMembershipsSuccess({ pagedReply });
      spyOn(membershipService, 'search').and.returnValue(of(pagedReply));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const searchParams = new SearchParams();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = MembershipStoreActions.searchMembershipsRequest({ searchParams });
      const completion = MembershipStoreActions.searchMembershipsFailure({ error });
      spyOn(membershipService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('addMembershipRequestEffect', () => {

    it('should respond with success', () => {
      const membership = new Membership().deserialize(factory.membership());
      const action = MembershipStoreActions.addMembershipRequest({ membership });
      const completion = MembershipStoreActions.addMembershipSuccess({ membership });
      spyOn(membershipService, 'add').and.returnValue(of(membership));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const membership = new Membership().deserialize(factory.membership());
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = MembershipStoreActions.addMembershipRequest({ membership });
      const completion = MembershipStoreActions.addMembershipFailure({ error });
      spyOn(membershipService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('getMembershipRequestEffect', () => {

    it('should respond with success', () => {
      const membership = new Membership().deserialize(factory.membership());
      const action = MembershipStoreActions.getMembershipRequest({ slug: membership.slug });
      const completion = MembershipStoreActions.getMembershipSuccess({ membership });
      spyOn(membershipService, 'get').and.returnValue(of(membership));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const membership = new Membership().deserialize(factory.membership());
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = MembershipStoreActions.getMembershipRequest({ slug: membership.slug });
      const completion = MembershipStoreActions.getMembershipFailure({ error });
      spyOn(membershipService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let membership: Membership;
    let action: Action;
    let membershipListener: any;

    beforeEach(() => {
      membership = new Membership().deserialize(factory.membership());
      action = MembershipStoreActions.updateMembershipRequest({
        membership,
        attributeName: 'name',
        value: factory.stringNext()
      });
      membershipListener = jest.spyOn(membershipService, 'update');
    });

    it('should respond with success', () => {
      const completion = MembershipStoreActions.updateMembershipSuccess({ membership });

      membershipListener.mockReturnValue(of(membership));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = MembershipStoreActions.updateMembershipFailure({ error });

      membershipListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeMembershipRequestEffect', () => {

    let membership: Membership;
    let action: Action;

    beforeEach(() => {
      membership = new Membership().deserialize(factory.membership());
      action = MembershipStoreActions.removeMembershipRequest({ membership });
      jest.spyOn(membershipService, 'removeMembership');
    });

    it('should respond with success', () => {
      const completion = MembershipStoreActions.removeMembershipSuccess({
        membershipId: membership.id
      });

      jest.spyOn(membershipService, 'removeMembership').mockReturnValue(of(membership.id));
      actions = hot('--a-', { a: action });
      expect(effects.removeMembershipRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = MembershipStoreActions.removeMembershipFailure({ error });

      jest.spyOn(membershipService, 'removeMembership').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeMembershipRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
