import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchFilterValues, SearchParams } from '@app/domain';
import { Membership } from '@app/domain/access';
import { MembershipStoreActions, MembershipStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { TruncatePipe } from '@app/shared/pipes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MembershipsViewComponent } from './memberships-view.component';

describe('MembershipsViewComponent', () => {
  let component: MembershipsViewComponent;
  let fixture: ComponentFixture<MembershipsViewComponent>;
  let store: Store<MembershipStoreReducer.State>;
  let router: Router;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'membership': MembershipStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        })
      ],
      declarations: [
        MembershipsViewComponent,
        TruncatePipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);

    fixture = TestBed.createComponent(MembershipsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('for total count', () => {

    it('membership count initialized', () => {
      const memberships = [];
      const pagedReply = factory.pagedReply(memberships);
      store.dispatch(new MembershipStoreActions.SearchMembershipsSuccess({ pagedReply }));

      component.membershipPageInfo$.subscribe((pageInfo: any) => {
        expect(pageInfo.total).toBe(memberships.length);
      });
    });

    it('total is displayed', fakeAsync(() => {
      const de = fixture.debugElement;
      expect(de.nativeElement.querySelector('.card-body').textContent).toContain('Loading');

      const pagedReply = factory.pagedReply([]);
      store.dispatch(new MembershipStoreActions.SearchMembershipsSuccess({ pagedReply }));

      flush();
      fixture.detectChanges();
      expect(de.nativeElement.querySelector('.card-body').textContent).not.toContain('Loading');
    }));

  });

  describe('for name filter', () => {

    it('reloads page when name filter is modified', () => {
      const storeListener = jest.spyOn(store, 'dispatch');
      const filters: SearchFilterValues[] = [ { name: 'test' } ];

      filters.forEach(value => {
        component.onFiltersUpdated(value);

        const action = new MembershipStoreActions.SearchMembershipsRequest({
          searchParams: new SearchParams('name:like:test', undefined, 1, 5)
        });

        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(action);
      });
    });

    it('displays that there are no matches for the name filter', () => {
      const pagedReply = factory.pagedReply([]);
      pagedReply.searchParams.filter = 'name:like:test';
      store.dispatch(new MembershipStoreActions.SearchMembershipsSuccess({ pagedReply }));
      fixture.detectChanges();

      const de = fixture.debugElement;
      expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
      expect(de.nativeElement.querySelector('.alert').textContent)
        .toContain('warning There are no memberships that match your criteria.');
    });

  });

  it('reloads page when a sort is selected', () => {
    const storeListener = jest.spyOn(store, 'dispatch');
    component.sortFieldSelected('name');

    const action = new MembershipStoreActions.SearchMembershipsRequest({
      searchParams: new SearchParams('', 'name', 1, 5)
    });

    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0]).toEqual(action);
  });

  describe('when a new page is selected', () => {

    let storeListener: any;

    beforeEach(() => {
      storeListener = jest.spyOn(store, 'dispatch');
    });

    it('reloads page when a new page is selected', () => {
      component.paginationPageChanged(1);

      const action = new MembershipStoreActions.SearchMembershipsRequest({
        searchParams: new SearchParams('', undefined, 1, 5)
      });

      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(action);
    });

    it('update is ignored if the event is NaN', () => {
      component.paginationPageChanged('test' as any);
      expect(storeListener.mock.calls.length).toBe(0);
    });

  });

  it('route is changed when a membership is selected', () => {
    const membership = new Membership().deserialize(factory.membership());
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.membershipSelected(membership);
    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ 'view', membership.slug, 'summary' ]);
  });

  it('displays memberships', () => {
    const membership = new Membership().deserialize(factory.membership());
    const pagedReply = factory.pagedReply([ membership ]);
    store.dispatch(new MembershipStoreActions.SearchMembershipsSuccess({ pagedReply }));
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(1);
    expect(de.nativeElement.querySelectorAll('.card-footer').length).toBe(1);
  });

  it('displays an error if the server replies with an error', () => {
    const error = {
      status: 404,
      error: {
        message: 'simulated error'
      }
    };
    store.dispatch(new MembershipStoreActions.SearchMembershipsFailure({ error }));
    component.sortFieldSelected('name');
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent)
      .toContain('Server error. Please contact your web site administrator.');
  });
});
