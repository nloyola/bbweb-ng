import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed, flush, fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProcessingTypeStoreReducer, StudyStoreReducer, StudyStoreActions, EventTypeStoreReducer, ProcessingTypeStoreActions, EventTypeStoreActions } from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { StudyProcessingComponent } from './study-processing.component';
import { Study, StudyState, ProcessingType, CollectionEventType } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';

describe('StudyProcessingComponent', () => {

  let component: StudyProcessingComponent;
  let fixture: ComponentFixture<StudyProcessingComponent>;
  let store: Store<StudyStoreReducer.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'processing-type': ProcessingTypeStoreReducer.reducer,
          'event-type': EventTypeStoreReducer.reducer
        })
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [ StudyProcessingComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudyProcessingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const study = new Study().deserialize(factory.study());
    expect(study.state).toBe(StudyState.Disabled);
    mockActivatedRouteSnapshot(study);
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('when study has or does not have event types', fakeAsync(() => {
    const study = new Study().deserialize(factory.study());

    const eventType = new CollectionEventType().deserialize(
      factory.collectionEventType({ specimenDefinitions: [ factory.collectedSpecimenDefinition() ]}));
    const eventTypeNoSpecimens = new CollectionEventType().deserialize(factory.collectionEventType());

    mockActivatedRouteSnapshot(study);
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    fixture.detectChanges();

    [ false, true  ].forEach((hasSpecimenDefinitions) => {
      if (hasSpecimenDefinitions) {
        store.dispatch(new EventTypeStoreActions.GetSpecimenDefinitionNamesSuccess({
          studySlug: study.slug,
          specimenDefinitionNames: factory.collectedSpecimenDefinitionNames([ eventType ])
        }));
      }
      flush();
      fixture.detectChanges();

      expect(component.studyData$).toBeObservable(cold('b', {
        b: {
          study,
          hasSpecimenDefinitions
        }
      }));
    });
  }));

  describe('when user wants to add a processing type', () => {

    it('changes state if study is disabled', async(() => {
      const router = TestBed.get(Router);
      const routerListener = jest.spyOn(router, 'navigate');
      const ngZone = TestBed.get(NgZone);
      ngZone.run(() => router.initialNavigation());

      const study = new Study().deserialize(factory.study());
      expect(study.state).toBe(StudyState.Disabled);
      mockActivatedRouteSnapshot(study);

      store.dispatch(StudyStoreActions.getStudySuccess({ study }));
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        ngZone.run(() => component.addProcessingTypeSelected());
        expect(routerListener.mock.calls.length).toBe(1);
        expect(routerListener.mock.calls[0][0]).toEqual([ '../add' ]);
      });
    }));

    it('throws an error if is study is not disabled', () => {
      [ StudyState.Enabled, StudyState.Retired ].forEach(state => {
        const studyWrongState = new Study().deserialize({
          ...factory.study(),
          state
        });
        mockActivatedRouteSnapshot(studyWrongState);
        store.dispatch(StudyStoreActions.getStudySuccess({ study: studyWrongState }));
        fixture.detectChanges();
        expect(() => component.addProcessingTypeSelected()).toThrowError('modifications not allowed');
      });
    });

  });

  it('changes state when user selects a processing type', async(() => {
    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate');
    const ngZone = TestBed.get(NgZone);
    ngZone.run(() => router.initialNavigation());

    const study = new Study().deserialize(factory.study());
    expect(study.state).toBe(StudyState.Disabled);

    const processingType = new ProcessingType().deserialize(factory.processingType());

    mockActivatedRouteSnapshot(study);
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      ngZone.run(() => component.processingTypeSelected(processingType));
      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual([ processingType.slug ]);
    });
  }));

  function mockActivatedRouteSnapshot(study: Study): void {
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        snapshot: {
          params: {
            slug: study.slug
          }
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {}
    }));
  }
});
