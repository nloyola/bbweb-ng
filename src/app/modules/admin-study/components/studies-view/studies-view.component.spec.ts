import { CUSTOM_ELEMENTS_SCHEMA, NgZone, Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchFilterValues, SearchParams } from '@app/domain';
import { Study, StudyState, StudyCountsUIMap } from '@app/domain/studies';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { StudyStoreActions, StudyStoreReducer } from '@app/root-store/study';
import { Factory } from '@test/factory';
import { Store, StoreModule } from '@ngrx/store';
import { StudiesViewComponent } from './studies-view.component';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { ToastrModule } from 'ngx-toastr';

describe('StudiesViewComponent', () => {

  let component: StudiesViewComponent;
  let fixture: ComponentFixture<StudiesViewComponent>;
  let store: Store<StudyStoreReducer.State>;
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
          'study': StudyStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [
        TestComponent,
        StudiesViewComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);

    fixture = TestBed.createComponent(StudiesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('study counts are mapped correctly', () => {
    const studyCounts = factory.studyCounts();
    const action = StudyStoreActions.getStudyCountsSuccess({ studyCounts });
    store.dispatch(action);

    component['studyCountData$'].subscribe((countMap: StudyCountsUIMap) => {
      expect(countMap.get(StudyState.Disabled).count).toBe(studyCounts.disabledCount);
      expect(countMap.get(StudyState.Enabled).count).toBe(studyCounts.enabledCount);
      expect(countMap.get(StudyState.Retired).count).toBe(studyCounts.retiredCount);
    });
  });

  it('counts are displayed', async(() => {
    const de = fixture.debugElement;
    expect(de.nativeElement.querySelector('.card-body').textContent).toContain('Loading');

    const action = StudyStoreActions.searchStudiesSuccess({
      pagedReply: factory.pagedReply([])
    });
    store.dispatch(action);

    fixture.detectChanges();
    expect(de.nativeElement.querySelector('.card-body').textContent).not.toContain('Loading');
  }));

  it('reloads page when a filter is modified', () => {
    spyOn(store, 'dispatch').and.callThrough();
    const filters: SearchFilterValues[] = [
      { name: 'test' },
      { stateId: StudyState.Disabled }
    ];

    filters.forEach(value => {
      component.onFiltersUpdated(value);

      const action = StudyStoreActions.searchStudiesRequest({
        searchParams: new SearchParams('name:like:test', undefined, 1, 5)
      });

      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  it('reloads page when a sort is selected', () => {
    spyOn(store, 'dispatch').and.callThrough();
    component.sortFieldSelected('name');

    const action = StudyStoreActions.searchStudiesRequest({
      searchParams: new SearchParams('', 'name', 1, 5)
    });

    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

  describe('when a new page is selected', () => {

    it('reloads page when a new page is selected', () => {
      spyOn(store, 'dispatch').and.callThrough();
      component.paginationPageChanged(1);

      const action = StudyStoreActions.searchStudiesRequest({
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

  it('route is changed when a study is selected', () => {
    const study = new StudyUI(new Study().deserialize(factory.study()));
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.studySelected(study);
    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ study.slug, 'summary' ]);
  });

  it('displays that there are no studies in the system', () => {
    const pagedReply = factory.pagedReply([]);
    pagedReply.searchParams.filter = '';
    const action = StudyStoreActions.searchStudiesSuccess({ pagedReply });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent)
      .toContain('No studies have been added yet.');
  });

  it('displays that there are no matches for the filters', () => {
    const pagedReply = factory.pagedReply([]);
    pagedReply.searchParams.filter = 'name:like:test';
    const action = StudyStoreActions.searchStudiesSuccess({ pagedReply });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent)
      .toContain('There are no studies that match your criteria.');
  });

  it('displays studies', () => {
    const study = new Study().deserialize(factory.study());
    const action = StudyStoreActions.searchStudiesSuccess({
      pagedReply: factory.pagedReply([ study ])
    });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(1);
    expect(de.nativeElement.querySelectorAll('.card-footer').length).toBe(1);
  });

});
