import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeInputSubformComponent } from './processing-type-input-subform.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProcessingType, ProcessedSpecimenDefinitionName, CollectedSpecimenDefinitionName } from '@app/domain/studies';
import { Factory } from '@test/factory';

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
  let factory: Factory;

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
    factory = new Factory();
  });

  it('should create', () => {
    component.processingType = new ProcessingType().deserialize(factory.processingType());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
