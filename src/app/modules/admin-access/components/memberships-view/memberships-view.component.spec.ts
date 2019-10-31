import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchFilterValues } from '@app/domain';
import { Membership } from '@app/domain/access';
import {
  MembershipStoreActions,
  MembershipStoreReducer,
  NgrxRuntimeChecks,
  RootStoreState
} from '@app/root-store';
import { TruncatePipe } from '@app/shared/pipes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MembershipsViewComponent } from './memberships-view.component';
import { By } from '@angular/platform-browser';

describe('MembershipsViewComponent', () => {
  let component: MembershipsViewComponent;
  let fixture: ComponentFixture<MembershipsViewComponent>;
  let store: Store<RootStoreState.State>;
  let router: Router;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            membership: MembershipStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [MembershipsViewComponent, TruncatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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

  it('membership count initialized', () => {
    const memberships = [];
    const pagedReply = factory.pagedReply(memberships);
    store.dispatch(MembershipStoreActions.searchMembershipsSuccess({ pagedReply }));

    component.totalMemberships$.subscribe(total => {
      expect(total).toBe(memberships.length);
    });
  });

  describe('for name filter', () => {
    it('reloads page when name filter is modified', () => {
      const storeListener = jest.spyOn(store, 'dispatch');
      const filters: SearchFilterValues[] = [{ name: 'test' }];

      filters.forEach(value => {
        component.onFiltersUpdated(value);

        const action = MembershipStoreActions.searchMembershipsRequest({
          searchParams: { filter: 'name:like:test', sort: undefined, page: 1, limit: 5 }
        });

        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(action);
      });
    });

    it('displays that there are no matches for the name filter', () => {
      const pagedReply = factory.pagedReply([]);
      pagedReply.searchParams = {
        ...pagedReply.searchParams,
        filter: 'name:like:test'
      };
      store.dispatch(MembershipStoreActions.searchMembershipsSuccess({ pagedReply }));
      fixture.detectChanges();

      const de = fixture.debugElement;
      expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
      expect(de.nativeElement.querySelector('.alert').textContent).toContain(
        'warning There are no memberships that match your criteria.'
      );
    });
  });

  it('reloads page when a sort is selected', () => {
    const storeListener = jest.spyOn(store, 'dispatch');
    component.sortFieldSelected('name');

    const action = MembershipStoreActions.searchMembershipsRequest({
      searchParams: { filter: '', sort: 'name', page: 1, limit: 5 }
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

      const action = MembershipStoreActions.searchMembershipsRequest({
        searchParams: { filter: '', sort: undefined, page: 1, limit: 5 }
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
    expect(routerListener.mock.calls[0][0]).toEqual(['view', membership.slug, 'summary']);
  });

  it('displays memberships', () => {
    const memberships = [new Membership().deserialize(factory.membership())];
    const pagedReply = {
      ...factory.pagedReply(memberships),
      maxPages: 5
    };
    store.dispatch(MembershipStoreActions.searchMembershipsSuccess({ pagedReply }));
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(memberships.length);
    expect(fixture.debugElement.queryAll(By.css('.card-footer')).length).toBe(1);
  });
});
