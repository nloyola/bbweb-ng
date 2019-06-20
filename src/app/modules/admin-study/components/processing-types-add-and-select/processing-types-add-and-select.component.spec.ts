import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingTypeStoreReducer, StudyStoreReducer } from '@app/root-store';
import { TruncatePipe } from '@app/shared/pipes';
import { StoreModule, Store } from '@ngrx/store';
import { ProcessingTypesAddAndSelectComponent } from './processing-types-add-and-select.component';
import { Factory } from '@test/factory';
import { Study, StudyState, ProcessingType } from '@app/domain/studies';
import { MockActivatedRoute } from '@test/mocks';
import { ActivatedRoute } from '@angular/router';

describe('ProcessingTypesAddAndSelectComponent', () => {
  let component: ProcessingTypesAddAndSelectComponent;
  let fixture: ComponentFixture<ProcessingTypesAddAndSelectComponent>;
  let store: Store<RootStoreState.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'processing-type': ProcessingTypeStoreReducer.reducer
        })
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [
        ProcessingTypesAddAndSelectComponent,
        TruncatePipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(ProcessingTypesAddAndSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const study = new Study().deserialize(factory.study());
    mockActivatedRouteSnapshot(study);
    component.study = study;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('is add allowed assigned correctly', () => {
    Object.values(StudyState).forEach(state => {
      const study = new Study().deserialize({
        ...factory.study(),
        state
      });
      mockActivatedRouteSnapshot(study);
      component.study = study;
      component.ngOnInit();
      fixture.detectChanges();
      expect(component.isAddAllowed).toBe(state === StudyState.Disabled);
    });
  });

  describe('common functionality', () => {

    it('makes a request from the server', () => {
      const study = new Study().deserialize(factory.study());
      const testData = [
        { componentFunc: () => component.onFiltersUpdated('name::test') },
        { componentFunc: () => component.paginationPageChange() }
      ];
      const storeListener = jest.spyOn(store, 'dispatch');

      mockActivatedRouteSnapshot(study);
      component.study = study;
      fixture.detectChanges();
      storeListener.mockReset();
      testData.forEach(testInfo => {
        testInfo.componentFunc();
      });
      expect(storeListener.mock.calls.length).toBe(testData.length);
    });

    it('test for emitters', () => {
      const study = new Study().deserialize(factory.study());
      const processingType = new ProcessingType().deserialize(factory.processingType());
      const testData = [
        {
          componentFunc: () => component.add(),
          emitter: component.addSelected
        },
        {
          componentFunc: () => component.processingTypeSelected(processingType),
          emitter: component.selected
        }
      ];
      jest.spyOn(store, 'dispatch');

      component.study = study;
      mockActivatedRouteSnapshot(study);
      fixture.detectChanges();
      testData.forEach(testInfo => {
        jest.spyOn(testInfo.emitter, 'emit').mockReturnValue(null);
        testInfo.componentFunc();
        expect(testInfo.emitter.emit).toHaveBeenCalled();
      });
    });

  });

  function mockActivatedRouteSnapshot(study: Study): void {
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        snapshot: {
          data: {
            study
          }
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        slug: study.slug
      }
    }));
  }
});
