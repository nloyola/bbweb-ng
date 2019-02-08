import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingOutputSpecimenModalComponent } from './processing-output-specimen-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProcessingType } from '@app/domain/studies';
import { Factory } from '@test/factory';

describe('ProcessingOutputSpecimenModalComponent', () => {
  let component: ProcessingOutputSpecimenModalComponent;
  let fixture: ComponentFixture<ProcessingOutputSpecimenModalComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule
      ],
      declarations: [
        ProcessingOutputSpecimenModalComponent
      ],
      providers: [
        NgbActiveModal
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();

    factory = new Factory();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingOutputSpecimenModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.processingType = new ProcessingType().deserialize(factory.processingType());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
