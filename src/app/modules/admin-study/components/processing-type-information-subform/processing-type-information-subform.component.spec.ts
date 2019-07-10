import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProcessingType } from '@app/domain/studies';
import { ProcessingTypeStoreReducer } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ProcessingTypeInformationSubformComponent } from './processing-type-information-subform.component';

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
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        StoreModule.forRoot(
          { 'processing-type': ProcessingTypeStoreReducer.reducer },
          NgrxRuntimeChecks
        )
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
  });

  it('should create', () => {
    component.processingType = new ProcessingType().deserialize(factory.processingType());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
