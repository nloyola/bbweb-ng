import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StudyCounts, StudyCountInfo, StudyCountsUI, StudyState, Study } from '@app/domain/studies';
import { SpinnerStoreReducer, SpinnerStoreActions } from '@app/root-store/spinner';
import { StudyStoreActions, StudyStoreReducer } from '@app/root-store/study';
import { Factory } from '@app/test/factory';
import { Store, StoreModule } from '@ngrx/store';
import { StudiesAdminComponent } from './studies-admin.component';
import { By } from '@angular/platform-browser';
import { SearchFilterValues, SearchParams } from '@app/domain';
import { dispatch } from 'rxjs/internal/observable/pairs';
import { Router } from '@angular/router';

describe('StudiesAdminComponent', () => {

  let store: Store<StudyStoreReducer.State>;
  let router: Router;
  let factory: Factory;
  let component: StudiesAdminComponent;
  let fixture: ComponentFixture<StudiesAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        })
      ],
      declarations: [StudiesAdminComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    store = TestBed.get(Store);
    router = TestBed.get(Router);
    factory = new Factory();
    fixture = TestBed.createComponent(StudiesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('study counts are mapped correctly', () => {
    const de = fixture.debugElement;

    const studyCounts = factory.studyCounts();
    const action = new StudyStoreActions.GetStudyCountsSuccess({ studyCounts });
    store.dispatch(action);

    component['studyCountData$'].subscribe((countMap: StudyCountsUI) => {
      expect(countMap.get(StudyState.Disabled).count).toBe(studyCounts.disabledCount);
      expect(countMap.get(StudyState.Enabled).count).toBe(studyCounts.enabledCount);
      expect(countMap.get(StudyState.Retired).count).toBe(studyCounts.retiredCount);
    });
  });

  it('counts are displayed', async(() => {
    const de = fixture.debugElement;
    expect(de.nativeElement.querySelector('.card-body').textContent).toContain('Loading');

    const action = new StudyStoreActions.SearchStudiesSuccess({
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

      const action = new StudyStoreActions.SearchStudiesRequest({
        searchParams: new SearchParams('name:like:test', undefined, 1, 5)
      });

      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  it('reloads page when a sort is selected', () => {
    spyOn(store, 'dispatch').and.callThrough();
    component.sortFieldSelected('name');

    const action = new StudyStoreActions.SearchStudiesRequest({
      searchParams: new SearchParams('', 'name', 1, 5)
    });

    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

  describe('when a new page is selected', () => {

    it('reloads page when a new page is selected', () => {
      spyOn(store, 'dispatch').and.callThrough();
      component.paginationPageChanged(1);

      const action = new StudyStoreActions.SearchStudiesRequest({
        searchParams: new SearchParams('', undefined, 1, 5)
      });

      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('update is ignored if the event is NaN', () => {
      spyOn(store, 'dispatch').and.callThrough();
      component.paginationPageChanged('test');
      expect(store.dispatch).not.toHaveBeenCalled();

    });

  });

  it('route is changed when a study is selected', () => {
    const study = new Study().deserialize(factory.study());
    spyOn(router, 'navigate').and.callThrough();
    component.studySelected(study);
    expect(router.navigate).toHaveBeenCalledWith([ '/admin/studies/view', study.slug ]);
  });

  it('displays that there are no studies in the system', () => {
    const pagedReply = factory.pagedReply([]);
    pagedReply.searchParams.filter = '';
    const action = new StudyStoreActions.SearchStudiesSuccess({ pagedReply });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent)
      .toContain('No studies have been added yet.');
  });

  it('displays that there are no results for the filters', () => {
    const pagedReply = factory.pagedReply([]);
    pagedReply.searchParams.filter = 'name:like:test';
    const action = new StudyStoreActions.SearchStudiesSuccess({ pagedReply });
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(0);
    expect(de.nativeElement.querySelector('.alert').textContent)
      .toContain('There are no studies that match your criteria.');
  });

  it('displays studies', () => {
    const study = new Study().deserialize(factory.study());
    const action = new StudyStoreActions.SearchStudiesSuccess({
      pagedReply: factory.pagedReply([ study ])
    })
    store.dispatch(action);
    fixture.detectChanges();

    const de = fixture.debugElement;
    expect(de.nativeElement.querySelectorAll('.list-group-item').length).toBe(1);
    expect(de.nativeElement.querySelectorAll('.card-footer').length).toBe(1);
  });

});
