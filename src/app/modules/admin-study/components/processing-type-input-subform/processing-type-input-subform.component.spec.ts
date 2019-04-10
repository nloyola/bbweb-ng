import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CollectedSpecimenDefinitionName, CollectionEventType, ProcessedSpecimenDefinitionName, ProcessingType } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { ProcessingTypeFixture } from '@test/fixtures';
import { ProcessingTypeInputSubformComponent } from './processing-type-input-subform.component';

describe('ProcessingTypeInputSubformComponent', () => {

  @Component({
    template  : `<form [formGroup]="form">
                   <app-processing-type-input-subform [processingType]="processingType"
                                                      [processedDefinitionNames]="processedDefinitionNames"
                                                      [collectedDefinitionNames]="collectedDefinitionNames"
                                                      [subform]="inputSubForm">
                   </app-processing-type-input-subform>
                 </form>`
  })
  class TestComponent implements OnInit {

    form: FormGroup;
    processingType: ProcessingType;
    processedDefinitionNames: ProcessedSpecimenDefinitionName[] = [];
    collectedDefinitionNames: CollectedSpecimenDefinitionName[] = [];

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
      this.form = this.formBuilder.group({
        inputSubForm: ProcessingTypeInputSubformComponent.buildSubForm(this.processingType),
      });
    }

    get inputSubForm() {
      return this.form.get('inputSubForm');
    }
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  const factory = new Factory();
  const entitiesFixture = new ProcessingTypeFixture(factory);

  const dynamicInputs = [
    'definitionId',
    'expectedChange',
    'count'
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        TestComponent,
        ProcessingTypeInputSubformComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.processingType = entitiesFixture.createProcessingTypeWithAnnotations();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initilization with an existing processing type', () => {

    it('should create with processing type from collected specimen', () => {
      const processingTypes = [
        entitiesFixture.createProcessingTypeFromCollected().processingType,
        entitiesFixture.createProcessingTypeFromProcessed().processingType
      ];

      processingTypes.forEach((processingType) => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        component.processingType = processingType;
        fixture.detectChanges();

        expect(component.inputSubForm.get('entityId').enabled)
          .toBe(processingType.input.definitionType === 'collected');

        expect(component.inputSubForm.get('inputProcessingType').enabled)
          .toBe(processingType.input.definitionType === 'processed');
      });

    });

  });

  describe('initialization with a NEW processing type', () => {

    it('should create with processing type from collected specimen', () => {
      component.processingType = new ProcessingType();
      fixture.detectChanges();
      expect(component.inputSubForm.get('inputProcessingType').enabled).toBe(false);

      dynamicInputs.forEach(input => {
        expect(component.inputSubForm.get(input).enabled).toBe(false);
      });
    });

  });

  it('when definition type is changed, the correct inputs are enable and disable', () => {
    const { input, processingType } = entitiesFixture.createProcessingTypeFromProcessed();
    const eventType = new CollectionEventType().deserialize(factory.defaultCollectionEventType());

    component.processingType = processingType;
    component.processedDefinitionNames = entitiesFixture.processedDefinitionNames([ input, processingType ]);
    component.collectedDefinitionNames = entitiesFixture.collectedDefinitionNames([ eventType ]);
    fixture.detectChanges();

    const definitionTypes = [ 'collected', 'processed' ];
    definitionTypes.forEach((definitionType) => {
      const inputElem = fixture.debugElement.query(By.css(`input[value="${definitionType}"]`)).nativeElement;
      inputElem.click();

      if (definitionType === 'collected') {
        expect(component.inputSubForm.get('entityId').enabled).toBe(true);
        expect(component.inputSubForm.get('entityId').value).toBe('');
      } else {
        expect(component.inputSubForm.get('entityId').enabled).toBe(false);
        expect(component.inputSubForm.get('definitionId').enabled).toBe(false);
        expect(component.inputSubForm.get('inputProcessingType').value).toBe('');
      }

      expect(component.inputSubForm.get('expectedChange').enabled).toBe(false);
      expect(component.inputSubForm.get('count').enabled).toBe(false);
    });
  });

  describe('when selecting an input', () => {

    function commonSetup() {
      const eventTypes = [
        new CollectionEventType().deserialize(factory.collectionEventType()),
        new CollectionEventType().deserialize(factory.collectionEventType())
      ];
      const { eventType, input, processingType } = entitiesFixture.createProcessingTypeFromProcessed();
      eventTypes.push(eventType);

      component.processingType = input;
      component.processedDefinitionNames =
        entitiesFixture.processedDefinitionNames([ input, processingType ]);
      component.collectedDefinitionNames =
        entitiesFixture.collectedDefinitionNames(eventTypes);
      fixture.detectChanges();

      return {
        eventTypes,
        input,
        processingType
      };
    }

    describe('when selecting an event type', () => {

      it('when an event type is selected, the correct inputs are enabled and disabled', () => {
        const { eventTypes, input, processingType } = commonSetup();

        const selectOption = fixture.debugElement.query(By.css(`option[value="${eventTypes[0].id}"]`));
        selectOption.parent.nativeElement.value = eventTypes[0].id;
        selectOption.parent.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(component.inputSubForm.get('definitionId').enabled).toBe(true);
      });

      it('when an event type is UNSELECTED, the correct inputs are enabled and disabled', () => {
        const { eventTypes, input, processingType } = commonSetup();

        const selectOption = fixture.debugElement.query(By.css(`option[value="${eventTypes[0].id}"]`));
        selectOption.parent.nativeElement.value = '';
        selectOption.parent.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(component.inputSubForm.get('definitionId').enabled).toBe(false);
        expect(component.inputSubForm.get('expectedChange').enabled).toBe(false);
        expect(component.inputSubForm.get('count').enabled).toBe(false);
      });

      /* tslint:disable-next-line:max-line-length */
      it('when a specimen from an event type is selected, the correct inputs are enabled and disabled', () => {
        const { eventTypes, input, processingType } = commonSetup();
        const specimenDefinitionId = eventTypes[2].specimenDefinitions[0].id;

        const selectOption = fixture.debugElement.query(By.css(`option[value="${specimenDefinitionId}"]`));
        selectOption.parent.nativeElement.value = specimenDefinitionId;
        selectOption.parent.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(component.inputSubForm.get('definitionId').value).toBe(specimenDefinitionId);
        expect(component.inputSubForm.get('expectedChange').enabled).toBe(true);
        expect(component.inputSubForm.get('count').enabled).toBe(true);
      });

      /* tslint:disable-next-line:max-line-length */
      it('when a specimen from an event type is UNSELECTED, the correct inputs are enabled and disabled', () => {
        const { eventTypes, input, processingType } = commonSetup();
        const specimenDefinitionId = eventTypes[2].specimenDefinitions[0].id;

        const selectOption = fixture.debugElement.query(By.css(`option[value="${specimenDefinitionId}"]`));
        selectOption.parent.nativeElement.value = '';
        selectOption.parent.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(component.inputSubForm.get('definitionId').value).toBe('');
        expect(component.inputSubForm.get('expectedChange').enabled).toBe(false);
        expect(component.inputSubForm.get('count').enabled).toBe(false);
      });

    });

    describe('when selecting a processing type', () => {

      it('when an processing type is selected, the correct inputs are enabled and disabled', () => {
        const { eventTypes, input, processingType } = commonSetup();

        const processedRadioElem = fixture.debugElement.query(By.css('input[value="processed"'));
        processedRadioElem.nativeElement.click();
        fixture.detectChanges();

        const selectOption = fixture.debugElement.query(By.css(`option[value="${processingType.id}"]`));
        expect(selectOption).not.toBeNull();
        selectOption.parent.nativeElement.value = processingType.id;
        selectOption.parent.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(component.inputSubForm.get('inputProcessingType').enabled).toBe(true);
        expect(component.inputSubForm.get('inputProcessingType').value).toBe(processingType.id);
        expect(component.inputSubForm.get('definitionId').enabled).toBe(false);
        expect(component.inputSubForm.get('expectedChange').enabled).toBe(true);
        expect(component.inputSubForm.get('count').enabled).toBe(true);
      });

      it('when a processing type is UNSELECTED, the correct inputs are enabled and disabled', () => {
        const { eventTypes, input, processingType } = commonSetup();

        const processedRadioElem = fixture.debugElement.query(By.css('input[value="processed"'));
        processedRadioElem.nativeElement.click();
        fixture.detectChanges();

        const selectOption = fixture.debugElement.query(By.css(`option[value="${processingType.id}"]`));
        selectOption.parent.nativeElement.value = '';
        selectOption.parent.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(component.inputSubForm.get('inputProcessingType').enabled).toBe(true);
        expect(component.inputSubForm.get('inputProcessingType').value).toBe('');
        expect(component.inputSubForm.get('definitionId').enabled).toBe(false);
        expect(component.inputSubForm.get('expectedChange').enabled).toBe(false);
        expect(component.inputSubForm.get('count').enabled).toBe(false);
      });

    });

  });
});
