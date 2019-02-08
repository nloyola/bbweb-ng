import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProcessingInputSpecimenModalComponent } from './processing-input-specimen-modal.component';
import { Factory } from '@test/factory';
import { ProcessingType, Study } from '@app/domain/studies';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { ProcessingTypeStoreReducer } from '@app/root-store';

describe('ProcessingInputSpecimenModalComponent', () => {
  let component: ProcessingInputSpecimenModalComponent;
  let fixture: ComponentFixture<ProcessingInputSpecimenModalComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule,
        ReactiveFormsModule,
        StoreModule.forRoot({
          'processing-type': ProcessingTypeStoreReducer.reducer
        })
      ],
      providers: [
        NgbActiveModal
      ],
      declarations: [
        ProcessingInputSpecimenModalComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingInputSpecimenModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.study = new Study().deserialize(factory.study());
    component.processingType = new ProcessingType().deserialize(factory.processingType());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
