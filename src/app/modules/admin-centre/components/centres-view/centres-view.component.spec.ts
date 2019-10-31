import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchFilterValues, SearchParams } from '@app/domain';
import { Centre, CentreCountsUIMap, CentreState } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { CentreStoreActions, CentreStoreReducer, RootStoreState, NgrxRuntimeChecks } from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule } from 'ngx-toastr';
import { CentresViewComponent } from './centres-view.component';

describe('CentresViewComponent', () => {
  let component: CentresViewComponent;
  let fixture: ComponentFixture<CentresViewComponent>;
  let ngZone: NgZone;
  let store: Store<RootStoreState.State>;
  let router: Router;
  const factory = new Factory();

  @Component({ template: 'Test component' })
  class TestComponent {}

  const routes: Routes = [
    {
      path: ':slug/summary',
      component: TestComponent
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        StoreModule.forRoot(
          {
            centre: CentreStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      declarations: [TestComponent, CentresViewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);

    ngZone.run(() => router.initialNavigation());

    fixture = TestBed.createComponent(CentresViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('centre counts are mapped correctly', () => {
    const centreCounts = factory.centreCounts();
    const action = CentreStoreActions.getCentreCountsSuccess({ centreCounts });
    store.dispatch(action);

    component['centreCountData$'].subscribe((countMap: CentreCountsUIMap) => {
      expect(countMap.get(CentreState.Disabled).count).toBe(centreCounts.disabledCount);
      expect(countMap.get(CentreState.Enabled).count).toBe(centreCounts.enabledCount);
    });
  });

  it('reloads page when a filter is modified', () => {
    spyOn(store, 'dispatch').and.callThrough();
    const filters: SearchFilterValues[] = [
      { name: 'test' }
      //{ stateId: CentreState.Disabled }
    ];

    const dispatchListener = jest.spyOn(store, 'dispatch');

    filters.forEach(value => {
      component.onFiltersUpdated(value);
      const searchParams = {
        filter: 'name:like:test',
        page: 1,
        limit: 5
      };
      const action = CentreStoreActions.searchCentresRequest({ searchParams });
      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(action);
    });
  });

  it('reloads page when a sort is selected', () => {
    spyOn(store, 'dispatch').and.callThrough();
    component.sortFieldSelected('name');

    const searchParams = {
      filter: '',
      sort: 'name',
      page: 1,
      limit: 5
    };
    const action = CentreStoreActions.searchCentresRequest({ searchParams });
    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

  describe('when a new page is selected', () => {
    it('reloads page when a new page is selected', () => {
      spyOn(store, 'dispatch').and.callThrough();
      component.paginationPageChanged(1);
      const searchParams = {
        filter: '',
        page: 1,
        limit: 5
      };
      const action = CentreStoreActions.searchCentresRequest({ searchParams });
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('update is ignored if the event is NaN', () => {
      spyOn(store, 'dispatch').and.callThrough();
      component.paginationPageChanged('test' as any);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  it('route is changed when a centre is selected', () => {
    const centre = new CentreUI(new Centre().deserialize(factory.centre()));
    spyOn(router, 'navigate').and.callThrough();
    ngZone.run(() => component.centreSelected(centre));
    expect(router.navigate).toHaveBeenCalled();
    expect((router.navigate as any).calls.mostRecent().args[0]).toEqual([centre.slug, 'summary']);
  });

  it('displays that there are no centres in the system', () => {
    const emptyPagedReply = factory.pagedReply([]);
    const pagedReply = {
      ...emptyPagedReply,
      searchParams: {
        ...emptyPagedReply.searchParams,
        filter: '',
        sort: undefined,
        page: 1,
        limit: 5
      }
    };
    const action = CentreStoreActions.searchCentresSuccess({ pagedReply });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent).toContain('No centres have been added yet.');
  });

  it('displays that there are no results for the filters', () => {
    const emptyPagedReply = factory.pagedReply([]);
    const searchParams = {
      ...emptyPagedReply.searchParams,
      filter: 'name:like:test',
      page: 1,
      limit: 5
    };
    const pagedReply = {
      ...emptyPagedReply,
      searchParams: {
        ...emptyPagedReply.searchParams,
        ...searchParams
      }
    };
    store.dispatch(CentreStoreActions.searchCentresRequest({ searchParams }));
    store.dispatch(CentreStoreActions.searchCentresSuccess({ pagedReply }));
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent).toContain(
      'There are no centres that match your criteria.'
    );
  });

  it('displays centres', () => {
    const centre = new Centre().deserialize(factory.centre());
    const emptyPagedReply = factory.pagedReply([centre]);
    const searchParams = {
      ...emptyPagedReply.searchParams,
      filter: '',
      page: 1,
      limit: 5
    };
    const pagedReply = {
      ...emptyPagedReply,
      searchParams: {
        ...emptyPagedReply.searchParams,
        ...searchParams
      }
    };
    const action = CentreStoreActions.searchCentresSuccess({ pagedReply });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(1);
    expect(de.nativeElement.querySelectorAll('.card-footer').length).toBe(1);
  });
});
