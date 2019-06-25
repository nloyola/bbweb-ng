import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEventType, Study, StudyState } from '@app/domain/studies';
import { EventTypeStoreReducer, NgrxRuntimeChecks, RootStoreState, StudyStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { TruncatePipe } from '@app/shared/pipes';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { EventTypesAddAndSelectComponent } from './event-types-add-and-select.component';

describe('EventTypesAddAndSelectComponent', () => {

  let component: EventTypesAddAndSelectComponent;
  let fixture: ComponentFixture<EventTypesAddAndSelectComponent>;
  let store: Store<RootStoreState.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'spinner': SpinnerStoreReducer.reducer,
            'study': StudyStoreReducer.reducer,
            'event-type': EventTypeStoreReducer.reducer
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
      declarations: [
        EventTypesAddAndSelectComponent,
        TruncatePipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(EventTypesAddAndSelectComponent);
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
      const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
      const testData = [
        {
          componentFunc: () => component.add(),
          emitter: component.addSelected
        },
        {
          componentFunc: () => component.eventTypeSelected(eventType),
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

  it('returns the correct recurring label for an event type', () => {
    const study = new Study().deserialize(factory.study());
    component.study = study;
    mockActivatedRouteSnapshot(study);
    fixture.detectChanges();

    [ true, false ].forEach(recurring => {
      const eventType = new CollectionEventType().deserialize({
        ...factory.collectionEventType(),
        recurring
      });
      expect(component.getRecurringLabel(eventType)).toBe(recurring ? 'Rec' : 'NonRec');
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
