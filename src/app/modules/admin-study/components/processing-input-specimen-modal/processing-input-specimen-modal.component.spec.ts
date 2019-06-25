import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreReducer, NgrxRuntimeChecks, ProcessingTypeStoreActions, ProcessingTypeStoreReducer, RootStoreState, StudyStoreReducer } from '@app/root-store';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ProcessingTypeFixture } from '@test/fixtures';
import { cold } from 'jasmine-marbles';
import { ProcessingTypeInputSubformComponent } from '../processing-type-input-subform/processing-type-input-subform.component';
import { ProcessingInputSpecimenModalComponent } from './processing-input-specimen-modal.component';

describe('ProcessingInputSpecimenModalComponent', () => {
  let component: ProcessingInputSpecimenModalComponent;
  let fixture: ComponentFixture<ProcessingInputSpecimenModalComponent>;
  let store: Store<RootStoreState.State>;
  const factory = new Factory();
  const entityFixture = new ProcessingTypeFixture(factory);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule,
        ReactiveFormsModule,
        StoreModule.forRoot(
          {
            'study': StudyStoreReducer.reducer,
            'processing-type': ProcessingTypeStoreReducer.reducer,
            'event-type': EventTypeStoreReducer.reducer
          },
          NgrxRuntimeChecks)
      ],
      providers: [
        NgbModal,
        NgbActiveModal
      ],
      declarations: [
        ProcessingTypeInputSubformComponent,
        ProcessingInputSpecimenModalComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(ProcessingInputSpecimenModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    createFixtureEntities();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create a valid form', () => {
    const { study, processingType } = createFixtureEntities();
    fixture.detectChanges();
    expect(component.form.get('inputSubForm')).toBeDefined();
  });

  it('dispatches the correct actions on initialization', () => {
    const { study } = createFixtureEntities();

    const storeListener = jest.spyOn(store, 'dispatch');
    fixture.detectChanges();

    expect(storeListener.mock.calls.length).toBe(2);

    expect(storeListener.mock.calls[0][0])
      .toEqual(new ProcessingTypeStoreActions.GetSpecimenDefinitionNamesRequest({ studyId: study.id }));

    expect(storeListener.mock.calls[1][0])
      .toEqual(EventTypeStoreActions.getSpecimenDefinitionNamesRequest({ studySlug: study.slug }));
  });

  it('selects the processed and collected specimen definitions', () => {
    const { study,
            eventType,
            input,
            processingType,
            processedDefinitionNames,
            collectedDefinitionNames
          } = createFixtureEntities();
    fixture.detectChanges();
    expect(component.entityNames$).toBeObservable(cold('b', {
      b: {
        processed: processedDefinitionNames,
        collected: collectedDefinitionNames
      }
    }));
  });

  describe('when user presses submit', () => {

    it('and a collected specimen is selected', () => {
      const { study,
              eventType,
              input,
              processingType,
              processedDefinitionNames,
              collectedDefinitionNames
            } = createFixtureEntities();
      fixture.detectChanges();

      const collectedDefinitionId = eventType.specimenDefinitions[0].id;

      const collectedRadioElem = fixture.debugElement.query(By.css('input[value="collected"'));
      collectedRadioElem.nativeElement.click();
      fixture.detectChanges();

      const entityIdOptionElem = fixture.debugElement.query(By.css(`option[value="${eventType.id}"`));
      expect(entityIdOptionElem).not.toBeNull();
      entityIdOptionElem.parent.nativeElement.value = eventType.id;
      entityIdOptionElem.parent.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const collectedDefinitionOptionElem = fixture.debugElement
        .query(By.css(`option[value="${collectedDefinitionId}"`));
      expect(collectedDefinitionOptionElem).not.toBeNull();
      collectedDefinitionOptionElem.parent.nativeElement.value = collectedDefinitionId;
      collectedDefinitionOptionElem.parent.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      component.inputSubForm.get('entityId').setValue(eventType.id);
      component.inputSubForm.get('definitionType').setValue('collected');
      component.inputSubForm.get('definitionId').setValue(collectedDefinitionId);
      component.inputSubForm.get('expectedChange').setValue(1);
      component.inputSubForm.get('count').setValue(1);
      fixture.detectChanges();

      const activeModalListener = jest.spyOn(component.activeModal, 'close');
      component.onSubmit();
      expect (activeModalListener).toHaveBeenCalledWith({
        entityId:             eventType.id,
        definitionType:       'collected',
        specimenDefinitionId: eventType.specimenDefinitions[0].id,
        expectedChange:       1,
        count:                1,
        containerTypeId:      null
      });
    });

    it('and a processed specimen is selected', () => {
      const { input } = createFixtureEntities();
      fixture.detectChanges();

      const processedRadioElem = fixture.debugElement.query(By.css('input[value="processed"'));
      processedRadioElem.nativeElement.click();
      fixture.detectChanges();

      component.inputSubForm.get('definitionType').setValue('processed');
      component.inputSubForm.get('inputProcessingType').setValue(input.id);
      component.inputSubForm.get('expectedChange').setValue(2);
      component.inputSubForm.get('count').setValue(2);
      fixture.detectChanges();

      const activeModalListener = jest.spyOn(component.activeModal, 'close');
      component.onSubmit();
      expect (activeModalListener).toHaveBeenCalledWith({
        entityId:             input.id,
        definitionType:       'processed',
        specimenDefinitionId: input.output.specimenDefinition.id,
        expectedChange:       2,
        count:                2,
        containerTypeId:      null
      });
    });

  });

  function createFixtureEntities() {
    const study = new Study().deserialize(factory.defaultStudy());
    const { eventType, input, processingType } = entityFixture.createProcessingTypeFromProcessed();
    const processedDefinitionNames = entityFixture.processedDefinitionNames([ input, processingType ]);
    const collectedDefinitionNames = entityFixture.collectedDefinitionNames([ eventType ]);

    component.study = study;
    component.processingType = processingType;
    store.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeSuccess({ processingType }));
    store.dispatch(
      new ProcessingTypeStoreActions.GetSpecimenDefinitionNamesSuccess({
        specimenDefinitionNames: processedDefinitionNames
      }));
    store.dispatch(EventTypeStoreActions.getSpecimenDefinitionNamesSuccess({
      studySlug: study.slug,
      specimenDefinitionNames: collectedDefinitionNames
    }));
    return { study, eventType, input, processingType, processedDefinitionNames, collectedDefinitionNames };
  }
});
