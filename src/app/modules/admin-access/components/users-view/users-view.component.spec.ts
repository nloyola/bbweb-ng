import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchFilterValues, SearchParams } from '@app/domain';
import { User, UserUI, UserCountsUIMap, UserState } from '@app/domain/users';
import { UserStoreActions, UserStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { EntityFiltersComponent } from '@app/shared/components/entity-filters/entity-filters.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { UsersViewComponent } from './users-view.component';

describe('UsersViewComponent', () => {
  let component: UsersViewComponent;
  let fixture: ComponentFixture<UsersViewComponent>;
  let store: Store<UserStoreReducer.State>;
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
          'user': UserStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        })
      ],
      declarations: [
        EntityFiltersComponent,
        UsersViewComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
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
      const users = [];
      const pagedReply = factory.pagedReply(users);
      store.dispatch(new UserStoreActions.SearchUsersSuccess({ pagedReply }));

      component.userPageInfo$.subscribe((pageInfo: any) => {
        expect(pageInfo.totalUsers).toBe(users.length);
      });
    });

    it('total is displayed', fakeAsync(() => {
      const de = fixture.debugElement;
      expect(de.nativeElement.querySelector('.row .card-body').textContent).toContain('Loading');

      const pagedReply = factory.pagedReply([]);
      store.dispatch(new UserStoreActions.SearchUsersSuccess({ pagedReply }));

      flush();
      fixture.detectChanges();
      expect(de.nativeElement.querySelector('.row .card-body').textContent).not.toContain('Loading');
    }));

  });

  describe('for name filter', () => {

    it('reloads page when name filter is modified', () => {
      const storeListener = jest.spyOn(store, 'dispatch');
      const filters: any[] = [
        {
          value: { name: 'test' },
          searchParams: new SearchParams('name:like:test', undefined, 1, 5)
        },
        {
          value: { stateId: UserState.Active },
          searchParams: new SearchParams('state::active', undefined, 1, 5)
        },
      ];

      filters.forEach(filter => {
        const { value, searchParams } = filter;
        storeListener.mockClear();
        component.onFiltersUpdated(value);

        const action = new UserStoreActions.SearchUsersRequest({ searchParams });

        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(action);
      });
    });

    it('displays that there are no matches for the name filter', () => {
      const pagedReply = factory.pagedReply([]);
      pagedReply.searchParams.filter = 'name:like:test';
      store.dispatch(new UserStoreActions.SearchUsersSuccess({ pagedReply }));
      fixture.detectChanges();

      const de = fixture.debugElement;
      expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
      expect(de.nativeElement.querySelector('.alert').textContent)
        .toContain('warning There are no users that match your criteria.');
    });

  });

  it('reloads page when a sort is selected', () => {
    const storeListener = jest.spyOn(store, 'dispatch');
    component.sortFieldSelected('name');

    const action = new UserStoreActions.SearchUsersRequest({
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

      const action = new UserStoreActions.SearchUsersRequest({
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

  it('route is changed when a user is selected', () => {
    const user = new UserUI(new User().deserialize(factory.user()));
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.userSelected(user);
    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ 'view', user.slug, 'summary' ]);
  });

  it('displays users', () => {
    const user = new User().deserialize(factory.user());
    const pagedReply = factory.pagedReply([ user ]);
    store.dispatch(new UserStoreActions.SearchUsersSuccess({ pagedReply }));
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
    store.dispatch(new UserStoreActions.SearchUsersFailure({ error }));
    component.sortFieldSelected('name');
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent)
      .toContain('Server error. Please contact your web site administrator.');
  });
});
