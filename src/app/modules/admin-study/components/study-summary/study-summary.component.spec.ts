import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudySummaryComponent } from './study-summary.component';

describe('StudySummaryComponent', () => {
  let component: StudySummaryComponent;
  let fixture: ComponentFixture<StudySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
