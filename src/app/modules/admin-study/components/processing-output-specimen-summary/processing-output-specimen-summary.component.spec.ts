import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingOutputSpecimenSummaryComponent } from './processing-output-specimen-summary.component';

describe('ProcessingOutputSpecimenSummaryComponent', () => {
  let component: ProcessingOutputSpecimenSummaryComponent;
  let fixture: ComponentFixture<ProcessingOutputSpecimenSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingOutputSpecimenSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingOutputSpecimenSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
