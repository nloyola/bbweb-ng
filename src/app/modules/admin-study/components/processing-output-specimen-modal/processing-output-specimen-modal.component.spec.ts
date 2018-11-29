import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingOutputSpecimenModalComponent } from './processing-output-specimen-modal.component';

describe('ProcessingOutputSpecimenModalComponent', () => {
  let component: ProcessingOutputSpecimenModalComponent;
  let fixture: ComponentFixture<ProcessingOutputSpecimenModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingOutputSpecimenModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingOutputSpecimenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
