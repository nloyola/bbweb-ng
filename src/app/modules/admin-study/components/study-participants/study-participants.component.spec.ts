import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyParticipantsComponent } from './study-participants.component';

describe('StudyParticipantsComponent', () => {
  let component: StudyParticipantsComponent;
  let fixture: ComponentFixture<StudyParticipantsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyParticipantsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
