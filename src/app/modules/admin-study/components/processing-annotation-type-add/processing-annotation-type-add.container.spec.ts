import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingAnnotationTypeAddContainerComponent } from './processing-annotation-type-add.container';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';
import { ProcessingTypeStoreReducer, StudyStoreReducer, ProcessingTypeStoreActions } from '@app/root-store';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MockActivatedRoute } from '@test/mocks';
import { Study, ProcessingType } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { cold } from 'jasmine-marbles';

describe('ProcessingAnnotationTypeAddContainerComponent', () => {
  let component: ProcessingAnnotationTypeAddContainerComponent;
  let fixture: ComponentFixture<ProcessingAnnotationTypeAddContainerComponent>;
  const factory = new Factory();
  const mockActivatedRoute = new MockActivatedRoute();
  let ngZone: NgZone;
  let router: Router;
  let store: Store<StudyStoreReducer.State>;
  let toastr: ToastrService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'processing-type': ProcessingTypeStoreReducer.reducer
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
        ProcessingAnnotationTypeAddContainerComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(ProcessingAnnotationTypeAddContainerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const { study, processingType } = createFixtureEntitiesForAdd();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('dispatches the action to retrive the processing type', () => {
    const { study, processingType } = createFixtureEntitiesForAdd();

    const storeListener = jest.spyOn(store, 'dispatch');
    fixture.detectChanges();

    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0]).toEqual(new ProcessingTypeStoreActions.GetProcessingTypeRequest({
      studySlug: study.slug,
      processingTypeSlug: processingType.slug
    }));
  });

  it('assigns the processing type when it is added to the store', () => {
    const { study, processingType } = createFixtureEntitiesForAdd();
    fixture.detectChanges();
    expect(component.processingType).toEqual(processingType);
  });

  it('returns to the correct state when Cancel button is pressed', () => {
    const routerListener = jest.spyOn(router, 'navigate');
    const testData = [
      { path: 'annotationAdd', returnPath: '..' },
      { path: 'annotation', returnPath: '../..' }
    ];

    testData.forEach((testInfo, index) => {
      const { study, processingType } = (testInfo.path === 'annotationAdd')
        ? createFixtureEntitiesForAdd() : createFixtureEntitiesForUpdate();
      component.ngOnInit();
      fixture.detectChanges();

      ngZone.run(() => component.onCancel());
      expect(routerListener.mock.calls.length).toBe(index + 1);
      expect(routerListener.mock.calls[index][0]).toEqual([ testInfo.returnPath ]);
    });
  });

  describe('when submitting', () => {

    it('on valid submission', async(() => {
      jest.spyOn(store, 'dispatch');
      jest.spyOn(toastr, 'success').mockReturnValue(null);
      const routerListener = jest.spyOn(router, 'navigate');

      const annotationType = new AnnotationType().deserialize(factory.annotationType());
      component.annotationType = annotationType;
      const { study, processingType } = createFixtureEntitiesForAdd();
      const expectedAction =
        new ProcessingTypeStoreActions.UpdateProcessingTypeAddOrUpdateAnnotationTypeRequest({
          processingType,
          annotationType
        });

      component.onSubmit(annotationType);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

      expect(component.isSaving$).toBeObservable(cold('b', { b: true }));

      ngZone.run(() => store.dispatch(
        new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess({ processingType })));

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(component.isSaving$).toBeObservable(cold('b', { b: false }));
        expect(store.dispatch).toHaveBeenCalled();
        expect(toastr.success).toHaveBeenCalled();
        expect(routerListener.mock.calls[0][0]).toEqual(['..']);
      });
    }));

    it('on submission failure', async(() => {
      const testData = [
        {
          path: 'annotationAdd',
          savedMessage: 'Annotation Added'
        },
        {
          path: 'annotation',
          savedMessage: 'Annotation Updated'
        }
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

      testData.forEach(testInfo => {
        const { study, processingType } = (testInfo.path === 'annotationAdd')
          ? createFixtureEntitiesForAdd() : createFixtureEntitiesForUpdate();
        component.ngOnInit();

        store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));
        fixture.detectChanges();

        errors.forEach(error => {
          const annotationType = new AnnotationType().deserialize(factory.annotationType());
          component.onSubmit(annotationType);
          fixture.detectChanges();

          expect(component.savedMessage).toBe(testInfo.savedMessage);
          expect(component.isSaving$).toBeObservable(cold('b', { b: true }));

          store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeFailure({ error }));

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

  function createFixtureEntitiesForAdd(): { study: Study, processingType: ProcessingType } {
    const processingType = new ProcessingType().deserialize(factory.processingType());
    createFixtureEntities(processingType);
    return createFixtureEntities(processingType);
  }

  function createFixtureEntitiesForUpdate(): { study: Study, processingType: ProcessingType } {
    const annotationTypes = [ factory.annotationType() ];
    const processingType =
      new ProcessingType().deserialize(factory.processingType({ annotationTypes }));
    return createFixtureEntities(processingType);
  }

  function createFixtureEntities(processingType: ProcessingType) {
    const study = new Study().deserialize(factory.defaultStudy());
    component.processingType = processingType;
    if (processingType.annotationTypes.length > 0) {
      component.annotationType = processingType.annotationTypes[0];
    }
    createMockActivatedRouteSpies(study, processingType);
    store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));
    return { study, processingType };
  }

  function createMockActivatedRouteSpies(study: Study, processingType: ProcessingType): void {
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        parent: {
          parent: {
            snapshot: {
              data: {
                study
              },
              params: {
                slug: study.slug
              }
            }
          }
        }
      }
    }));

    const annotationTypeId = (processingType.annotationTypes.length > 0)
      ? processingType.annotationTypes[0].id : undefined;

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        processingTypeSlug: processingType.slug,
        annotationTypeId
      }
    }));
  }
});
