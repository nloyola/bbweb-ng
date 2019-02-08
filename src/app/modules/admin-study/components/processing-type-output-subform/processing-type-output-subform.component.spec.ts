import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollectedSpecimenDefinitionName, ProcessedSpecimenDefinitionName, ProcessingType } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { ProcessingTypeOutputSubformComponent } from './processing-type-output-subform.component';


describe('ProcessingTypeOutputSubformComponent', () => {
  @Component({
    template  : `<form [formGroup]="form">
                   <app-processing-type-output-subform [processingType]="processingType"
                                                       [subform]="outputSubForm">
                   </app-processing-type-output-subform>
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
      outputSubForm: ProcessingTypeOutputSubformComponent.buildSubForm(this.processingType),
      });
    }

    get outputSubForm() {
      return this.form.get('outputSubForm');
    }
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        TestComponent,
        ProcessingTypeOutputSubformComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    factory = new Factory();
  });

  it('should create', () => {
    component.processingType = new ProcessingType().deserialize(factory.processingType());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
