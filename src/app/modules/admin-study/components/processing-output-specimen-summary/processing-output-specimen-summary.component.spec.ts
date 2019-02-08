import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingOutputSpecimenSummaryComponent } from './processing-output-specimen-summary.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TruncatePipe } from '@app/shared/pipes';
import { Factory } from '@test/factory';
import { ProcessingType } from '@app/domain/studies';

describe('ProcessingOutputSpecimenSummaryComponent', () => {
  let component: ProcessingOutputSpecimenSummaryComponent;
  let fixture: ComponentFixture<ProcessingOutputSpecimenSummaryComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessingOutputSpecimenSummaryComponent,
        TruncatePipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingOutputSpecimenSummaryComponent);
    component = fixture.componentInstance;
    factory = new Factory();
  });

  it('should create', () => {
    const processingType = new ProcessingType().deserialize(factory.processingType());
    component.output = processingType.output;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
