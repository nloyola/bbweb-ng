import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingInputSpecimenModalComponent } from './processing-input-specimen-modal.component';

describe('ProcessingInputSpecimenModalComponent', () => {
  let component: ProcessingInputSpecimenModalComponent;
  let fixture: ComponentFixture<ProcessingInputSpecimenModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingInputSpecimenModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingInputSpecimenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
