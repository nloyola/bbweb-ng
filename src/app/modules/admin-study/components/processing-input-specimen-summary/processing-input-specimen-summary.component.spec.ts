import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingInputSpecimenSummaryComponent } from './processing-input-specimen-summary.component';

describe('ProcessingInputSpecimenSummaryComponent', () => {
  let component: ProcessingInputSpecimenSummaryComponent;
  let fixture: ComponentFixture<ProcessingInputSpecimenSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingInputSpecimenSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingInputSpecimenSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
