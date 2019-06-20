import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RoleStoreActions, RoleStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { TruncatePipe } from '@app/shared/pipes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { RolesViewComponent } from './roles-view.component';
import { SearchFilterValues, SearchParams } from '@app/domain';
import { Role } from '@app/domain/access';
import { By } from '@angular/platform-browser';

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
        StoreModule.forRoot({
          'role': RoleStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        })
      ],
      declarations: [
        RolesViewComponent,
        TruncatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
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
    store.dispatch(new RoleStoreActions.SearchRolesSuccess({ pagedReply }));

    component.rolePageInfo$.subscribe((pageInfo: any) => {
      expect(pageInfo.total).toBe(roles.length);
    });
  });

  describe('for name filter', () => {

    it('reloads page when name filter is modified', () => {
      const storeListener = jest.spyOn(store, 'dispatch');
      const filters: SearchFilterValues[] = [ { name: 'test' } ];

      filters.forEach(value => {
        component.onFiltersUpdated(value);

        const action = new RoleStoreActions.SearchRolesRequest({
          searchParams: new SearchParams('name:like:test', undefined, 1, 5)
        });

        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(action);
      });
    });

    it('displays that there are no matches for the name filter', () => {
      const pagedReply = factory.pagedReply([]);
      pagedReply.searchParams.filter = 'name:like:test';
      store.dispatch(new RoleStoreActions.SearchRolesSuccess({ pagedReply }));
      fixture.detectChanges();

      const de = fixture.debugElement;
      expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
      expect(de.nativeElement.querySelector('.alert').textContent)
        .toContain('warning There are no roles that match your criteria.');
    });

  });

  it('reloads page when a sort is selected', () => {
    const storeListener = jest.spyOn(store, 'dispatch');
    component.sortFieldSelected('name');

    const action = new RoleStoreActions.SearchRolesRequest({
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

      const action = new RoleStoreActions.SearchRolesRequest({
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

  it('route is changed when a role is selected', () => {
    const role = new Role().deserialize(factory.role());
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.roleSelected(role);
    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ 'view', role.slug, 'summary' ]);
  });

  it('displays roles', () => {
    const role = new Role().deserialize(factory.role());
    const pagedReply = factory.pagedReply([ role ]);
    store.dispatch(new RoleStoreActions.SearchRolesSuccess({ pagedReply }));
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(1);
    expect(de.nativeElement.querySelectorAll('.card-footer').length).toBe(1);
  });

});
