import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingInputSpecimenSummaryComponent } from './processing-input-specimen-summary.component';
import { Factory } from '@app/test/factory';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TruncatePipe } from '@app/shared/pipes';
import { ProcessingType } from '@app/domain/studies';

describe('ProcessingInputSpecimenSummaryComponent', () => {
  let component: ProcessingInputSpecimenSummaryComponent;
  let fixture: ComponentFixture<ProcessingInputSpecimenSummaryComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessingInputSpecimenSummaryComponent,
        TruncatePipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingInputSpecimenSummaryComponent);
    component = fixture.componentInstance;
    factory = new Factory();
  });

  it('should create', () => {
    const processingType = new ProcessingType().deserialize(factory.processingType());
    component.input = processingType.input;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
