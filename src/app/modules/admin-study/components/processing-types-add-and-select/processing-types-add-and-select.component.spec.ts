import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProcessingType, Study, StudyState } from '@app/domain/studies';
import {
  NgrxRuntimeChecks,
  ProcessingTypeStoreReducer,
  RootStoreState,
  StudyStoreReducer
} from '@app/root-store';
import { TruncatePipe } from '@app/shared/pipes';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { ProcessingTypesAddAndSelectComponent } from './processing-types-add-and-select.component';
import { DropdownMenuSelectableItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

describe('ProcessingTypesAddAndSelectComponent', () => {
  let component: ProcessingTypesAddAndSelectComponent;
  let fixture: ComponentFixture<ProcessingTypesAddAndSelectComponent>;
  let store: Store<RootStoreState.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(
          {
            study: StudyStoreReducer.reducer,
            'processing-type': ProcessingTypeStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [ProcessingTypesAddAndSelectComponent, TruncatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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

    const menuItemData = [['Add Step', 'addSelected']];

    it.each(menuItemData)('menu item "%s" emits the "%s" event', (label, emitterName) => {
      const study = new Study().deserialize(factory.study());
      component.study = study;
      mockActivatedRouteSnapshot(study);
      fixture.detectChanges();

      let eventProduced = false;
      component[emitterName].subscribe(() => {
        eventProduced = true;
      });

      const menuItem = component.menuItems.find(mi => mi.kind === 'selectable' && mi.label == label);
      const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
      expect(selectableMenuItem).toBeDefined();
      expect(selectableMenuItem.onSelected).toBeFunction();
      selectableMenuItem.onSelected();
      expect(eventProduced).toBe(true);
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
