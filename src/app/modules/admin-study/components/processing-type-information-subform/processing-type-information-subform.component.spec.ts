import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeInformationSubformComponent } from './processing-type-information-subform.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { ProcessingTypeStoreReducer } from '@app/root-store';
import { ProcessingType } from '@app/domain/studies';
import { Factory } from '@app/test/factory';

describe('ProcessingTypeInformationSubformComponent', () => {

  @Component({
    template  : `<form [formGroup]="form">
                   <app-processing-type-information-subform [processingType]="processingType"
                                                            [subform]="infoSubForm">
                   </app-processing-type-information-subform>
                 </form>`
  })
  class TestComponent implements OnInit {

    form: FormGroup;
    processingType: ProcessingType;

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
      this.form = this.formBuilder.group({
        infoSubForm: ProcessingTypeInformationSubformComponent.buildSubForm(this.processingType)
      });
    }

    get infoSubForm() {
      return this.form.get('infoSubForm');
    }
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot({
          'processing-type': ProcessingTypeStoreReducer.reducer
        })
      ],
      declarations: [
        TestComponent,
        ProcessingTypeInformationSubformComponent
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
