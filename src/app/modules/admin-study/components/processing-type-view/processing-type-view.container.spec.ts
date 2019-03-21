import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProcessingType, Study, StudyState } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreReducer, ProcessingTypeStoreActions, ProcessingTypeStoreReducer, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ProcessingTypeFixture, ProcessingTypeFixtureEntities } from '@test/fixtures';
import { MockActivatedRoute } from '@test/mocks';
import * as faker from 'faker';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ProcessingTypeViewContainerComponent } from './processing-type-view.container';
import { SpinnerStoreReducer } from '@app/root-store/spinner';

describe('ProcessingTypeViewContainerComponent', () => {
  let component: ProcessingTypeViewContainerComponent;
  let fixture: ComponentFixture<ProcessingTypeViewContainerComponent>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();
  const entityFixture = new ProcessingTypeFixture(factory);
  let store: Store<ProcessingTypeStoreReducer.State>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'processing-type': ProcessingTypeStoreReducer.reducer,
          'event-type': EventTypeStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
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
        ProcessingTypeViewContainerComponent,
        YesNoPipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(ProcessingTypeViewContainerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    createEntities();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('study is retrieved from store', () => {
    const { study, processingType } = entityFixture.createEntities();
    createMockActivatedRouteSpies(study, processingType);
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    fixture.detectChanges();
    expect(component.study).toBe(study);
  });

  it('processing type is retrieved from store', () => {
    const { study, processingType } = entityFixture.createEntities();
    createMockActivatedRouteSpies(study, processingType);
    store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));

    fixture.detectChanges();
    expect(component.processingType).toBe(processingType);
  });

  it('navigates to new path when name is changed', fakeAsync(() => {
    const modalService = TestBed.get(NgbModal);
    const { study, processingType } = entityFixture.createEntities();
    createMockActivatedRouteSpies(study, processingType);
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));
    flush();
    fixture.detectChanges();

    const newName = factory.stringNext();
    const ptWithNewName = new ProcessingType().deserialize({
      ...processingType as any,
      ...factory.nameAndSlug()
    });

    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newName) });
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess({
      processingType: ptWithNewName
    }));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([
      '/admin/studies', study.slug, 'processing', 'view', ptWithNewName.slug]);
  }));

  describe('for input entity', () => {

    describe('when already in the store', () => {

      it('when input is from collected, event type is retrieved from store', () => {
        const { eventType, processingType } = entityFixture.createProcessingTypeFromCollected();
        const study = new Study().deserialize(factory.defaultStudy());
        createMockActivatedRouteSpies(study, processingType);
        store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));
        store.dispatch(new EventTypeStoreActions.GetEventTypeSuccess({ eventType }));

        fixture.detectChanges();
        expect(component.inputEntity).toBe(eventType);
      });

      it('when input is from processed, processing type is retrieved from store', () => {
        const { input, processingType } = entityFixture.createProcessingTypeFromProcessed();
        const study = new Study().deserialize(factory.defaultStudy());

        createMockActivatedRouteSpies(study, processingType);
        store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({
          processingType: input
        }));
        store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));

        fixture.detectChanges();
        expect(component.inputEntity).toBe(input);
      });

    });

    describe('when not in the store', () => {

      it('when input is from collected, event type is retrieved from store', () => {
        const { study, processingType } = entityFixture.createEntities();
        createMockActivatedRouteSpies(study, processingType);
        store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));
        const storeListener = jest.spyOn(store, 'dispatch');

        fixture.detectChanges();
        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(
          new EventTypeStoreActions.GetEventTypeByIdRequest({
            studyId: processingType.studyId,
            eventTypeId: processingType.input.entityId
          }));
      });

      it('when input is from processed, processing type is retrieved from store', () => {
        const { input, processingType } = entityFixture.createProcessingTypeFromProcessed();
        const study = new Study().deserialize(factory.defaultStudy());

        createMockActivatedRouteSpies(study, processingType);
        store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));

        const storeListener = jest.spyOn(store, 'dispatch');
        fixture.detectChanges();
        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(
          new ProcessingTypeStoreActions.GetProcessingTypeByIdRequest({
            studyId: processingType.studyId,
            processingTypeId: processingType.input.entityId
          }));
      });

    });

  });

  it('allow changes is updated', () => {
    const stateValues = [
      { state: StudyState.Enabled, expectedAllowChanges: false },
      { state: StudyState.Disabled, expectedAllowChanges: true },
    ];

    const entities = createEntities();
    fixture.detectChanges();

    stateValues.forEach(stateValue => {
      const updatedStudy = new Study().deserialize({
        ...entities.study as any,
        state: stateValue.state
      });
      store.dispatch(new StudyStoreActions.UpdateStudySuccess({ study: updatedStudy }));

      fixture.detectChanges();
      expect(component.allowChanges).toBe(stateValue.expectedAllowChanges);
    });
  });

  describe('common behaviour', () => {

    /* tslint:disable:no-shadowed-variable */
    const componentUpdateFuncs = [
      (component, processingType) => component.updateName(),
      (component, processingType) => component.updateDescription(),
      (component, processingType) => component.updateEnabled(),
      (component, processingType) => component.removeAnnotationType(processingType.annotationTypes[0]),
      (component, processingType) => component.updateInputSpecimen(),
      (component, processingType) => component.updateOutputSpecimen(),
      (component, processingType) => component.removeProcessingType()
    ];
    /* tslint:disable:no-shadowed-variable */

    it('functions should open a modal', () => {
      const entities = createEntities();
      const annotationType = entities.processingType.annotationTypes[0];
      fixture.detectChanges();

      const modalService = TestBed.get(NgbModal);
      spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });

      const componentModalFuncs = componentUpdateFuncs.concat([
        (component, processingType) => component.viewAnnotationType(annotationType)
      ]);

      componentModalFuncs.forEach(modalFunc => modalFunc(component, entities.processingType));
      expect(modalService.open.calls.count()).toBe(componentModalFuncs.length);
    });

    it('functions should throw an error when study is not disabled', () => {
      const entities = createEntities();
      const annotationType = entities.processingType.annotationTypes[0];
      const updatedStudy = new Study().deserialize({
        ...entities.study as any,
        state: StudyState.Enabled
      });
      store.dispatch(new StudyStoreActions.UpdateStudySuccess({ study: updatedStudy }));
      fixture.detectChanges();

      const throwErrFuncs = componentUpdateFuncs.concat([
        (component, processingType) => component.addAnnotationType(annotationType),
        (component, processingType) => component.editAnnotationType(annotationType),
        (component, processingType) => component.addProcessingTypeSelected()
      ]);

      throwErrFuncs.forEach(modalFunc => {
        expect(() => modalFunc(component, entities.processingType)).toThrowError('modifications not allowed');
      });
    });

    it('functions that should notify the user', async(() => {
      const toastr = TestBed.get(ToastrService);
      const modalService = TestBed.get(NgbModal);
      const modalSpy = spyOn(modalService, 'open');
      spyOn(toastr, 'success').and.returnValue(null);

      const entities = createEntities();
      fixture.detectChanges();

      componentUpdateFuncs.forEach(updateFunc => {
        modalSpy.and.returnValue({
          componentInstance: {},
          result: Promise.resolve({ confirmed: true, value: 'test' })
        });

        updateFunc(component, entities.processingType);
        fixture.whenStable().then(() => {
          store.dispatch(new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess({
            processingType: entities.processingType
          }));
        });
      });

      fixture.whenStable().then(() => {
        expect(toastr.success.calls.count()).toBe(componentUpdateFuncs.length);
      });
    }));

  });

  describe('when updating name, description, enabled, input and output', () => {

    it('dispatches an action to update the processing type', fakeAsync(() => {
      const modalService = TestBed.get(NgbModal);
      const modalSpy = spyOn(modalService, 'open');
      const storeListener = jest.spyOn(store, 'dispatch');

      const entities = createEntities();
      const testData = [
        {
          updateFunc: () => component.updateName(),
          attribute: 'name',
          newValue: factory.stringNext(),
          withConfirm: true
        },
        {
          updateFunc: () => component.updateDescription(),
          attribute: 'description',
          newValue: faker.lorem.paragraph(),
          withConfirm: true
        },
        {
          updateFunc: () => component.updateEnabled(),
          attribute: 'enabled',
          newValue: !entities.processingType.enabled,
          withConfirm: true
        },
        {
          updateFunc: () => component.updateInputSpecimen(),
          attribute: 'inputSpecimenProcessing',
          newValue: entities.processingType.input
        },
        {
          updateFunc: () => component.updateOutputSpecimen(),
          attribute: 'outputSpecimenProcessing',
          newValue: entities.processingType.output
        }
      ];

      fixture.detectChanges();

      testData.forEach((testInfo) => {
        const modalResult = testInfo.withConfirm
          ? Promise.resolve(testInfo.newValue)
          : Promise.resolve(testInfo.newValue);
        modalSpy.and.returnValue({
          componentInstance: {},
          result: Promise.resolve(modalResult)
        });

        storeListener.mockReset();
        testInfo.updateFunc();
        flush();
        fixture.detectChanges();

        const action = new ProcessingTypeStoreActions.UpdateProcessingTypeRequest({
          processingType: entities.processingType,
          attributeName: testInfo.attribute,
          value: testInfo.newValue
        });

        expect(storeListener.mock.calls[0][0]).toEqual(action);
      });
    }));

  });

  describe('for annotation types', () => {

    it('changes state when adding an annotation type', () => {
      const ngZone = TestBed.get(NgZone);
      const router = TestBed.get(Router);
      ngZone.run(() => router.initialNavigation());

      spyOn(router, 'navigate').and.callThrough();

      createEntities();
      fixture.detectChanges();

      ngZone.run(() => component.addAnnotationType());
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual([ 'annotationAdd' ]);
    });

    it('when an annotation type is edited, a state change is made', () => {
      const ngZone = TestBed.get(NgZone);
      const router = TestBed.get(Router);
      ngZone.run(() => router.initialNavigation());

      spyOn(router, 'navigate').and.callThrough();

      const entities = createEntities();
      const annotationType = entities.processingType.annotationTypes[0];
      fixture.detectChanges();

      ngZone.run(() => component.editAnnotationType(annotationType));
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0])
        .toEqual([ 'annotation', annotationType.id ]);
    });

    describe('when removing an annotation type', () => {

      it('dispatches an event to update the processing type', fakeAsync(() => {
        const modalService = TestBed.get(NgbModal);

        jest.spyOn(modalService, 'open').mockReturnValue({
          componentInstance: {},
          result: Promise.resolve(true)
        });

        const entities = createEntities();
        const annotationType = entities.processingType.annotationTypes[0];
        flush();
        fixture.detectChanges();

        const storeListener = jest.spyOn(store, 'dispatch');
        component.removeAnnotationType(annotationType);
        flush();
        fixture.detectChanges();

        const action = new ProcessingTypeStoreActions.UpdateProcessingTypeRemoveAnnotationTypeRequest({
          processingType: entities.processingType,
          annotationTypeId: annotationType.id
        });

        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(action);
      }));

    });

  });

  describe('when removing an processing type', () => {

    it('dispatches an event to update the processing type', async(() => {
      const entities = createEntities();
      const modalService = TestBed.get(NgbModal);

      spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });
      spyOn(store, 'dispatch').and.callThrough();

      fixture.detectChanges();

      component.removeProcessingType();
      fixture.whenStable().then(() => {
        const action = new ProcessingTypeStoreActions.RemoveProcessingTypeRequest({
          processingType: entities.processingType
        });

        expect(store.dispatch).toHaveBeenCalledWith(action);
      });
    }));

    it('processing type becomes undefined when removed', fakeAsync(() => {
      const entities = createEntities();
      fixture.detectChanges();

      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const modalService = TestBed.get(NgbModal);
      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });

      component.removeProcessingType();
      flush();
      fixture.detectChanges();

      const action = new ProcessingTypeStoreActions.RemoveProcessingTypeSuccess({
        processingTypeId: entities.processingType.id
      });
      store.dispatch(action);
      flush();
      fixture.detectChanges();

      expect(component.processingType).toBeUndefined();
      expect(routerListener).toHaveBeenCalled();
      expect(routerListener.mock.calls[0][0]).toEqual([ '/admin/studies', entities.study.slug, 'processing' ]);
    }));

    it('opens a modal if the processing type is in use', () => {
      const entities = createEntities();
      const inUseProcessingType = new ProcessingType().deserialize({
        ...entities.processingType as any,
        inUse: true
      });

      store.dispatch(new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess({
        processingType: inUseProcessingType
      }));
      fixture.detectChanges();

      const modalService = TestBed.get(NgbModal);
      const modalListener = spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });

      component.removeProcessingType();
      fixture.detectChanges();

      expect(modalListener).toHaveBeenCalled();
      expect(component.processingType).not.toBeUndefined();
    });
  });

  describe('when user wants to add a processing type', () => {

    it('changes state if study is disabled', fakeAsync(() => {
      const ngZone = TestBed.get(NgZone);
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const entities = createEntities();

      flush();
      fixture.detectChanges();

      ngZone.run(() => component.addProcessingTypeSelected());
      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0])
        .toEqual([ `/admin/studies/${entities.study.slug}/processing/add` ]);
    }));

  });

  it('changes state when user selects a processing type', async(() => {
    const ngZone = TestBed.get(NgZone);
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    const entities = createEntities();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      ngZone.run(() => component.processingTypeSelected(entities.processingType));
      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0])
        .toEqual([ `/admin/studies/${entities.study.slug}/processing/${entities.processingType.slug}` ]);
    });
  }));

  function createEntities(): ProcessingTypeFixtureEntities {
    const { study, processingType } = entityFixture.createEntities();

    createMockActivatedRouteSpies(study, processingType);
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));

    return {
      study,
      processingType
    };
  }

  function createMockActivatedRouteSpies(study: Study, processingType: ProcessingType): void {
    mockActivatedRoute.spyOnParams(() => processingType);

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
      },
      snapshot: {
        params: {
          processingTypeSlug: processingType.slug
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {}
    }));
  }
});
