import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEventType, Study } from '@app/domain/studies';
import {
  EventTypeStoreActions,
  EventTypeStoreReducer,
  RootStoreState,
  StudyStoreActions,
  StudyStoreReducer
} from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { AnnotationTypeAddComponent } from '@app/shared/components/annotation-type-add/annotation-type-add.component';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CollectionAnnotationTypeAddContainerComponent } from './collection-annotation-type-add.container';

describe('CollectionAnnotationTypeAddContainerComponent', () => {
  let component: CollectionAnnotationTypeAddContainerComponent;
  let fixture: ComponentFixture<CollectionAnnotationTypeAddContainerComponent>;
  let ngZone: NgZone;
  const mockActivatedRoute = new MockActivatedRoute();
  let router: Router;
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
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            study: StudyStoreReducer.reducer,
            'event-type': EventTypeStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [AnnotationTypeAddComponent, CollectionAnnotationTypeAddContainerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

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

    fixture = TestBed.createComponent(CollectionAnnotationTypeAddContainerComponent);
    component = fixture.componentInstance;
    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    initializeComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('dispatches the action to retrieve the event type', () => {
    const eventType = initializeComponent();

    jest.spyOn(store, 'dispatch');
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(
      EventTypeStoreActions.getEventTypeRequest({
        studySlug: study.slug,
        eventTypeSlug: eventType.slug
      })
    );
  });

  it('assigns the event type when it is added to the store', () => {
    const eventType = initializeComponent();
    fixture.detectChanges();
    expect(component.eventType).toEqual(eventType);
  });

  it('returns to the correct state when Cancel button is pressed', () => {
    const eventType = initializeComponent();
    const routerListener = jest.spyOn(router, 'navigate');

    const testData = [{ path: 'annotationAdd', returnPath: '..' }, { path: 'annotation', returnPath: '..' }];

    testData.forEach((testInfo, index) => {
      routerListener.mockReset();
      mockActivatedRouteSnapshot(testInfo.path, eventType);
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      component.ngOnInit();
      fixture.detectChanges();

      ngZone.run(() => component.onCancel());
      expect(routerListener).toHaveBeenCalled();
      expect(routerListener.mock.calls[0][0]).toEqual([testInfo.returnPath]);
    });
  });

  describe('when submitting', () => {
    it('on valid submission', async(() => {
      const eventType = initializeComponent();
      const expectedAction = EventTypeStoreActions.updateEventTypeRequest({
        eventType,
        attributeName: 'addOrUpdateAnnotationType',
        value: eventType.annotationTypes[0]
      });

      jest.spyOn(store, 'dispatch');
      jest.spyOn(toastr, 'success').mockReturnValue(null);
      const spy = jest.spyOn(router, 'navigate');

      mockActivatedRouteSnapshot('annotationAdd', eventType);
      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      fixture.detectChanges();

      component.onSubmit(eventType.annotationTypes[0]);
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

    it('on submission failure', async(() => {
      const eventType = initializeComponent();
      const testData = [
        { path: 'annotationAdd', savedMessage: 'Annotation Added' },
        { path: 'annotation', savedMessage: 'Annotation Updated' }
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

      store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      fixture.detectChanges();

      testData.forEach(testInfo => {
        mockActivatedRouteSnapshot(testInfo.path, eventType);
        component.ngOnInit();

        errors.forEach(error => {
          component.onSubmit(eventType.annotationTypes[0]);
          fixture.detectChanges();

          expect(component.isSaving$).toBeObservable(cold('b', { b: true }));
          store.dispatch(EventTypeStoreActions.getEventTypeFailure({ error }));

          fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(component.isSaving$).toBeObservable(cold('b', { b: false }));
            expect(toastr.error).toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
          });
        });
      });
    }));
  });

  function createEventType(): CollectionEventType {
    return new CollectionEventType().deserialize(
      factory.collectionEventType({
        annotationTypes: [factory.annotationType()]
      })
    );
  }

  function initializeComponent(): CollectionEventType {
    const eventType = createEventType();
    mockActivatedRouteSnapshot('annotationAdd', eventType);
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
    return eventType;
  }

  function mockActivatedRouteSnapshot(path: string, eventType: CollectionEventType): void {
    const annotationTypeId = path === 'annotationAdd' ? undefined : eventType.annotationTypes[0].id;
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
        annotationTypeId
      }
    }));
  }
});
