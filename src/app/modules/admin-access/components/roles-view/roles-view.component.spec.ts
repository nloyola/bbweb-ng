import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchFilterValues } from '@app/domain';
import { Role } from '@app/domain/access';
import { NgrxRuntimeChecks, RoleStoreActions, RoleStoreReducer, RootStoreState } from '@app/root-store';
import { TruncatePipe } from '@app/shared/pipes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { RolesViewComponent } from './roles-view.component';

describe('RolesViewComponent', () => {
  let component: RolesViewComponent;
  let fixture: ComponentFixture<RolesViewComponent>;
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
            role: RoleStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [RolesViewComponent, TruncatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);

    fixture = TestBed.createComponent(RolesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('role count initialized', () => {
    const roles = [];
    const pagedReply = factory.pagedReply(roles);
    store.dispatch(RoleStoreActions.searchRolesSuccess({ pagedReply }));

    component.totalRoles$.subscribe(total => {
      expect(total).toBe(roles.length);
    });
  });

  describe('for name filter', () => {
    it('reloads page when name filter is modified', () => {
      const storeListener = jest.spyOn(store, 'dispatch');
      const filters: SearchFilterValues[] = [{ name: 'test' }];

      filters.forEach(value => {
        component.onFiltersUpdated(value);

        const action = RoleStoreActions.searchRolesRequest({
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
      store.dispatch(RoleStoreActions.searchRolesSuccess({ pagedReply }));
      fixture.detectChanges();

      const de = fixture.debugElement;
      expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
      expect(de.nativeElement.querySelector('.alert').textContent).toContain(
        'warning There are no roles that match your criteria.'
      );
    });
  });

  it('reloads page when a sort is selected', () => {
    const storeListener = jest.spyOn(store, 'dispatch');
    component.sortFieldSelected('name');

    const action = RoleStoreActions.searchRolesRequest({
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

      const action = RoleStoreActions.searchRolesRequest({
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

  it('route is changed when a role is selected', () => {
    const role = new Role().deserialize(factory.role());
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.roleSelected(role);
    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['view', role.slug, 'summary']);
  });

  it('displays roles', () => {
    const roles = [new Role().deserialize(factory.role())];
    const pagedReply = {
      ...factory.pagedReply(roles),
      maxPages: 5
    };
    store.dispatch(RoleStoreActions.searchRolesSuccess({ pagedReply }));
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(roles.length);
    expect(fixture.debugElement.queryAll(By.css('.card-footer')).length).toBe(1);
  });
});
