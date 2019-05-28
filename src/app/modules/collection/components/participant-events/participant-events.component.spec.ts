import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantEventsComponent } from './participant-events.component';

xdescribe('ParticipantEventsComponent', () => {
  let component: ParticipantEventsComponent;
  let fixture: ComponentFixture<ParticipantEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
