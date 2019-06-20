import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEventType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreReducer, StudyStoreReducer, StudyStoreActions } from '@app/root-store';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CollectedSpecimenDefinitionAddContainerComponent } from './collected-specimen-definition-add.container';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CollectedSpecimenDefinitionAddContainer', () => {

  let component: CollectedSpecimenDefinitionAddContainerComponent;
  let fixture: ComponentFixture<CollectedSpecimenDefinitionAddContainerComponent>;
  let ngZone: NgZone;
  let router: Router;
  const mockActivatedRoute = new MockActivatedRoute();
  let store: Store<RootStoreState.State>;
  let factory: Factory;
  let study: Study;
  let toastr: ToastrService;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize(factory.study());

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'event-type': EventTypeStoreReducer.reducer,
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [
        CollectedSpecimenDefinitionAddContainerComponent,
        YesNoPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();

    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        parent: {
          parent: {
            snapshot: {
              data: {
                study
              }
            }
          }
        }
      }
    }));
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(CollectedSpecimenDefinitionAddContainerComponent);
    component = fixture.componentInstance;
    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    const eventType = createEventType();
    mockActivatedRouteSnapshot('spcDefAdd', eventType);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('dispatches the action to retrive the event type', () => {
    const eventType = initializeComponent();
    const storeListener = jest.spyOn(store, 'dispatch');
    fixture.detectChanges();

    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0]).toEqual(
      EventTypeStoreActions.getEventTypeRequest({
      studySlug: study.slug,
      eventTypeSlug: eventType.slug
    }));
  });

  it('assigns the event type after it is added to the store', () => {
    const eventType = initializeComponent();
    fixture.detectChanges();
    expect(component.eventType).toEqual(eventType);
  });

  it('returns to the correct state when Cancel button is pressed', () => {
    const eventType = initializeComponent();
    const spy = jest.spyOn(router, 'navigate');

    const testData = [
      { path: 'spcDefAdd', returnPath: '..' },
      { path: 'spcDef', returnPath: '..' }
    ];

    testData.forEach((testInfo, index) => {
      mockActivatedRouteSnapshot(testInfo.path, eventType);
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      component.ngOnInit();
      fixture.detectChanges();

      ngZone.run(() => component.onCancel());
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[index][0]).toEqual([ testInfo.returnPath ]);
    });
  });

  describe('when submitting', () => {

    it('on valid submission', async(() => {
      const eventType = initializeComponent();
      const expectedAction = EventTypeStoreActions.updateEventTypeRequest({
        eventType,
        attributeName: 'addOrUpdateSpecimenDefinition',
        value: eventType.specimenDefinitions[0]
      });

      jest.spyOn(store, 'dispatch');
      jest.spyOn(toastr, 'success').mockReturnValue(null);
      const spy = jest.spyOn(router, 'navigate');

      mockActivatedRouteSnapshot('spcDefAdd', eventType);
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      fixture.detectChanges();

      component.onSubmit(eventType.specimenDefinitions[0]);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

      expect(component.isSaving$).toBeObservable(cold('b', { b: true }));

      ngZone.run(() => store.dispatch(EventTypeStoreActions.updateEventTypeSuccess({ eventType })));

      fixture.whenStable().then(() => {
        expect(component.isSaving$).toBeObservable(cold('b', { b: false }));
        expect(store.dispatch).toHaveBeenCalled();
        expect(toastr.success).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toEqual(['..']);
      });
    }));

    it('on submission failure', fakeAsync(() => {
      const testData = [
        { path: 'spcDefAdd', savedMessage: 'Specimen Added' },
        { path: 'spcDef', savedMessage: 'Specimen Updated' },
      ];
      const errors = [
        {
          status: 401,
          statusText: 'Unauthorized'
        },
        {
          status: 404,
          error: {
              message: 'simulated error'
          }
        },
        {
          status: 404,
          error: {
            message: 'EntityCriteriaError: name already used'
          }
        }
      ];

      jest.spyOn(toastr, 'error').mockReturnValue(null);
      jest.spyOn(router, 'navigate');

      const eventType = initializeComponent();
      store.dispatch(StudyStoreActions.getStudySuccess({ study }));
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      fixture.detectChanges();

      testData.forEach(testInfo => {
        component.ngOnInit();

        errors.forEach(error => {
          component.onSubmit(eventType.specimenDefinitions[0]);
          expect(component.isSaving$).toBeObservable(cold('b', { b: true }));
          store.dispatch(EventTypeStoreActions.getEventTypeFailure({ error }));
          flush();
          fixture.detectChanges();

          expect(component.isSaving$).toBeObservable(cold('b', { b: false }));
          expect(toastr.error).toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();
        });
      });
    }));

  });

  function createEventType(): CollectionEventType {
    return new CollectionEventType().deserialize(factory.collectionEventType({
      specimenDefinitions: [ factory.collectedSpecimenDefinition() ]
    }));
  }

  function mockActivatedRouteSnapshot(path: string, eventType: CollectionEventType): void {
    const specimenDefinitionId = (path === 'spcDefAdd') ? undefined : eventType.specimenDefinitions[0].id;
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        parent: {
          parent: {
            snapshot: {
              params: {
                slug: study.slug
              }
            }
          }
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        eventTypeSlug: eventType.slug,
        specimenDefinitionId
      },
      url: [
        { path }
      ]
    }));
  }

  function initializeComponent(): CollectionEventType {
    const eventType = createEventType();
    mockActivatedRouteSnapshot('spcDefAdd', eventType);
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
    return eventType;
  }

});
