import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantSummaryComponent } from './participant-summary.component';

xdescribe('ParticipantSummaryComponent', () => {
  let component: ParticipantSummaryComponent;
  let fixture: ComponentFixture<ParticipantSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
