import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchFilterValues, SearchParams } from '@app/domain';
import { Centre, CentreState, CentreCountsUIMap } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { CentreStoreActions, CentreStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
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
  class TestComponent { }

  const routes: Routes = [
    {
      path: ':slug/summary',
      component: TestComponent
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        StoreModule.forRoot({
          'centre': CentreStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [
        TestComponent,
        CentresViewComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
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
    const action = new CentreStoreActions.GetCentreCountsSuccess({ centreCounts });
    store.dispatch(action);

    component['centreCountData$'].subscribe((countMap: CentreCountsUIMap) => {
      expect(countMap.get(CentreState.Disabled).count).toBe(centreCounts.disabledCount);
      expect(countMap.get(CentreState.Enabled).count).toBe(centreCounts.enabledCount);
    });
  });

  it('reloads page when a filter is modified', () => {
    spyOn(store, 'dispatch').and.callThrough();
    const filters: SearchFilterValues[] = [
      { name: 'test' },
      { stateId: CentreState.Disabled }
    ];

    filters.forEach(value => {
      component.onFiltersUpdated(value);

      const action = new CentreStoreActions.SearchCentresRequest({
        searchParams: new SearchParams('name:like:test', undefined, 1, 5)
      });

      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  it('reloads page when a sort is selected', () => {
    spyOn(store, 'dispatch').and.callThrough();
    component.sortFieldSelected('name');

    const action = new CentreStoreActions.SearchCentresRequest({
      searchParams: new SearchParams('', 'name', 1, 5)
    });

    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

  describe('when a new page is selected', () => {

    it('reloads page when a new page is selected', () => {
      spyOn(store, 'dispatch').and.callThrough();
      component.paginationPageChanged(1);

      const action = new CentreStoreActions.SearchCentresRequest({
        searchParams: new SearchParams('', undefined, 1, 5)
      });

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
    expect((router.navigate as any).calls.mostRecent().args[0]).toEqual([ centre.slug, 'summary' ]);
  });

  it('displays that there are no centres in the system', () => {
    const pagedReply = factory.pagedReply([]);
    pagedReply.searchParams.filter = '';
    const action = new CentreStoreActions.SearchCentresSuccess({ pagedReply });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent)
      .toContain('No centres have been added yet.');
  });

  it('displays that there are no results for the filters', () => {
    const pagedReply = factory.pagedReply([]);
    pagedReply.searchParams.filter = 'name:like:test';
    const action = new CentreStoreActions.SearchCentresSuccess({ pagedReply });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent)
      .toContain('There are no centres that match your criteria.');
  });

  it('displays centres', () => {
    const centre = new Centre().deserialize(factory.centre());
    const action = new CentreStoreActions.SearchCentresSuccess({
      pagedReply: factory.pagedReply([ centre ])
    });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(1);
    expect(de.nativeElement.querySelectorAll('.card-footer').length).toBe(1);
  });
});
