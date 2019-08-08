import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { User, UserState, UserUI } from '@app/domain/users';
import { NgrxRuntimeChecks, RootStoreState, UserStoreActions, UserStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { EntityFiltersComponent } from '@app/shared/components/entity-filters/entity-filters.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { UserCountsComponent } from '../user-counts/user-counts.component';
import { UsersViewComponent } from './users-view.component';

describe('UsersViewComponent', () => {
  let component: UsersViewComponent;
  let fixture: ComponentFixture<UsersViewComponent>;
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
            user: UserStoreReducer.reducer,
            spinner: SpinnerStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [EntityFiltersComponent, UsersViewComponent, UserCountsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);

    fixture = TestBed.createComponent(UsersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('for total count', () => {
    it('user count initialized', () => {
      const userCounts = factory.userCounts();
      const action = UserStoreActions.getUserCountsSuccess({ userCounts });
      store.dispatch(action);
      fixture.detectChanges();

      component.userCountData$.subscribe(countData => {
        expect(countData).toBeTruthy();
      });
    });

    it('total is displayed', fakeAsync(() => {
      const comp = fixture.debugElement.queryAll(By.css('app-user-counts'));
      expect(comp.length).toBe(1);
      expect(comp[0].nativeElement.textContent).toContain('Retrieving counts');

      const userCounts = factory.userCounts();
      const action = UserStoreActions.getUserCountsSuccess({ userCounts });
      store.dispatch(action);
      flush();
      fixture.detectChanges();
      expect(comp[0].nativeElement.textContent).not.toContain('Retrieving counts');
    }));
  });

  describe('for name filter', () => {
    it('reloads page when name filter is modified', () => {
      const storeListener = jest.spyOn(store, 'dispatch');
      const filters: any[] = [
        {
          value: { name: 'test' },
          searchParams: { filter: 'name:like:test', sort: undefined, page: 1, limit: 5 }
        },
        {
          value: { stateId: UserState.Active },
          searchParams: { filter: 'state::active', sort: undefined, page: 1, limit: 5 }
        }
      ];

      filters.forEach(filter => {
        const { value, searchParams } = filter;
        storeListener.mockClear();
        component.onFiltersUpdated(value);

        const action = UserStoreActions.searchUsersRequest({ searchParams });

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
      store.dispatch(UserStoreActions.searchUsersSuccess({ pagedReply }));
      fixture.detectChanges();

      const de = fixture.debugElement;
      expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
      expect(de.nativeElement.querySelector('.alert').textContent).toContain(
        'warning There are no users that match your criteria.'
      );
    });
  });

  it('reloads page when a sort is selected', () => {
    const storeListener = jest.spyOn(store, 'dispatch');
    component.sortFieldSelected('name');

    const action = UserStoreActions.searchUsersRequest({
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

      const action = UserStoreActions.searchUsersRequest({
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

  it('route is changed when a user is selected', () => {
    const user = new UserUI(new User().deserialize(factory.user()));
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.userSelected(user);
    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['view', user.slug, 'summary']);
  });

  it('displays users', () => {
    const user = new User().deserialize(factory.user());
    const pagedReply = factory.pagedReply([user]);
    store.dispatch(UserStoreActions.searchUsersSuccess({ pagedReply }));
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(1);
    expect(de.nativeElement.querySelectorAll('.card-footer').length).toBe(1);
  });
});
