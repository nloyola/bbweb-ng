import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProcessingType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreReducer, ProcessingTypeStoreActions, ProcessingTypeStoreReducer, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { Store, StoreModule } from '@ngrx/store';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ProcessingTypeAddComponent } from './processing-type-add.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProcessingTypeFixture } from '@test/fixtures';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

describe('ProcessingTypeAddComponent', () => {
  let component: ProcessingTypeAddComponent;
  let fixture: ComponentFixture<ProcessingTypeAddComponent>;
  const factory = new Factory();
  let store: Store<ProcessingTypeStoreReducer.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  const entityFixture = new ProcessingTypeFixture(factory);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'processing-type': ProcessingTypeStoreReducer.reducer,
          'event-type': EventTypeStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [
        ProcessingTypeAddComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeAddComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
  });

  it('should create', () => {
    createEntityFixtures();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('on initialization', () => {

    it('retrieves the processed specimen definitions', () => {
      const study = createEntityFixtures();
      const storeListener = jest.spyOn(store, 'dispatch');
      fixture.detectChanges();

      expect(storeListener.mock.calls.length).toBeGreaterThan(0);
      expect(storeListener.mock.calls[0][0]).toEqual(
        new ProcessingTypeStoreActions.GetSpecimenDefinitionNamesRequest({ studyId: study.id }));
    });

    it('retrieves the collected specimen definitions', () => {
      const study = createEntityFixtures();
      const storeListener = jest.spyOn(store, 'dispatch');
      fixture.detectChanges();

      expect(storeListener.mock.calls.length).toBeGreaterThan(1);
      expect(storeListener.mock.calls[1][0]).toEqual(
        new EventTypeStoreActions.GetSpecimenDefinitionNamesRequest({ studySlug: study.slug }));
    });

  });

  describe('when user submits the processing type', () => {

    it('the correct action is dispatched', () => {
      createEntityFixtures();
      fixture.detectChanges();

      const storeListener = jest.spyOn(store, 'dispatch');
      component.onSubmit();
      fixture.detectChanges();

      const processingTypeToSave = component.formToProcessingType();
      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(
        new ProcessingTypeStoreActions.AddProcessingTypeRequest({ processingType: processingTypeToSave }));
    });

    it('returns to the correct URL after the processing type is added', () => {
      createEntityFixtures();
      fixture.detectChanges();

      const processingType = new ProcessingType().deserialize(factory.processingType());
      const router = TestBed.get(Router);
      const routerListener = jest.spyOn(router, 'navigate').mockReturnValue(true);

      component.onSubmit();
      store.dispatch(new ProcessingTypeStoreActions.AddProcessingTypeSuccess({ processingType }));
      fixture.detectChanges();

      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual(['../view', processingType.slug ]);
    });

    it('on submission failure', () => {
      const toastr = TestBed.get(ToastrService);
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
            message: 'EntityCriteriaError name already used'
          }
        }
      ];

      jest.spyOn(toastr, 'error').mockReturnValue(null);
      fixture.detectChanges();

      errors.forEach(error => {
        component.onSubmit();
        store.dispatch(new ProcessingTypeStoreActions.AddProcessingTypeFailure({ error }));
        fixture.detectChanges();
        expect(toastr.error).toHaveBeenCalled();
      });
    });

  });

  it('returns to the correct URL when the user cancels', () => {
    createEntityFixtures();
    fixture.detectChanges();

    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate').mockReturnValue(true);

    component.onCancel();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['..']);
  });

  describe('when adding a processing type with a collected specimen as input', () => {

    it('input entity name and specimen definition name are correct', () => {
      const { eventType, processingType } = entityFixture.createProcessingTypeFromCollected();
      createEntityFixtures();
      component.processingType = processingType;
      const specimenDefinitionNames = entityFixture.collectedDefinitionNames([ eventType ]);
      store.dispatch(
        new EventTypeStoreActions.GetSpecimenDefinitionNamesSuccess({ specimenDefinitionNames }));
      fixture.detectChanges();

      const processingTypeToSave = component.formToProcessingType();
      expect(processingTypeToSave.input.definitionType).toBe('collected');
      expect(processingTypeToSave.input.entityId).toBe(eventType.id);
      expect(processingTypeToSave.input.specimenDefinitionId).toBe(eventType.specimenDefinitions[0].id);
    });

  });

  describe('when adding a processing type with a processed specimen as input', () => {

    it('input entity name and specimen definition name are correct', () => {
      const { input, processingType } = entityFixture.createProcessingTypeFromProcessed();
      createEntityFixtures();
      component.processingType = processingType;
      const specimenDefinitionNames = entityFixture.processedDefinitionNames([ input, processingType ]);
      store.dispatch(
        new ProcessingTypeStoreActions.GetSpecimenDefinitionNamesSuccess({ specimenDefinitionNames }));
      fixture.detectChanges();

      const processingTypeToSave = component.formToProcessingType();
      expect(processingTypeToSave.input.definitionType).toBe('processed');
      expect(processingTypeToSave.input.entityId).toBe(input.id);
      expect(processingTypeToSave.input.specimenDefinitionId).toBe(input.output.specimenDefinition.id);
    });

    it('throws an error if processing type name is not found', () => {
      const { input, processingType } = entityFixture.createProcessingTypeFromProcessed();
      createEntityFixtures();
      component.processingType = processingType;
      fixture.detectChanges();
      expect(() => component.formToProcessingType()).toThrowError(/could not find specimen definition id/);
    });

  });

  describe('initializes variables to display summary', () => {

    describe('input entity name and specimen definition name are correct', () => {

      fit('when adding a processing type with a collected specimen as input', () => {

        const { eventType, processingType } = entityFixture.createProcessingTypeFromCollected();
        const study = createEntityFixtures();
        component.processingType = processingType;
        const specimenDefinitionNames = entityFixture.collectedDefinitionNames([ eventType ]);
        store.dispatch(
          new EventTypeStoreActions.GetSpecimenDefinitionNamesSuccess({
            studySlug: study.slug,
            specimenDefinitionNames
          }));
        fixture.detectChanges();

        const event: StepperSelectionEvent = {
          selectedIndex: 3,
          previouslySelectedIndex: 0,
          selectedStep: null,
          previouslySelectedStep: null
        };

        component.stepClick(event);
        expect(component.inputEntityName).toBe(eventType.name);
        expect(component.inputDefinitionName).toBe(eventType.specimenDefinitions[0].name);
      });

      it('when adding a processing type with a processed specimen as input', () => {
        const { input, processingType } = entityFixture.createProcessingTypeFromProcessed();
        createEntityFixtures();
        component.processingType = processingType;
        const specimenDefinitionNames = entityFixture.processedDefinitionNames([ input, processingType ]);
        store.dispatch(
          new ProcessingTypeStoreActions.GetSpecimenDefinitionNamesSuccess({ specimenDefinitionNames }));
        fixture.detectChanges();

        const event: StepperSelectionEvent = {
          selectedIndex: 3,
          previouslySelectedIndex: 0,
          selectedStep: null,
          previouslySelectedStep: null
        };

        component.stepClick(event);
        expect(component.inputEntityName).toBe(input.name);
        expect(component.inputDefinitionName).toBe(input.output.specimenDefinition.name);
      });

    });

  });

  function createMockActivatedRouteSpies(study: Study): void {
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        snapshot: {
          params: {
            slug: study.slug
          }
        }
      }
    }));
  }

  function createEntityFixtures(): Study {
    const study = new Study().deserialize(factory.study());
    createMockActivatedRouteSpies(study);
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    return study;
  }
});
