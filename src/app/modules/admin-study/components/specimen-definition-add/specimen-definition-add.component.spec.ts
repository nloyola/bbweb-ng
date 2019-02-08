import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProcessingType } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { SpecimenDefinitionAddComponent } from './specimen-definition-add.component';

describe('SpecimenDefinitionAddComponent', () => {
  @Component({
    template  : `<form [formGroup]="form">
                   <app-specimen-definition-add [specimenDefinition]="specimenDefinition"
                                                [subform]="subform">
                   </app-specimen-definition-add>
                 </form>`
  })
  class TestComponent implements OnInit {

    form: FormGroup;
    processingType: ProcessingType;

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
      this.form = this.formBuilder.group({
        subform: SpecimenDefinitionAddComponent.buildSubForm(this.processingType.output.specimenDefinition)
      });
    }

    get subform() {
      return this.form.get('subform');
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
        SpecimenDefinitionAddComponent
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
