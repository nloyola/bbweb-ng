import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyProcessingComponent } from './study-processing.component';

describe('StudyProcessingComponent', () => {
  let component: StudyProcessingComponent;
  let fixture: ComponentFixture<StudyProcessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyProcessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
