import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantAddPageComponent } from './participant-add-page.component';

describe('ParticipantAddPageComponent', () => {
  let component: ParticipantAddPageComponent;
  let fixture: ComponentFixture<ParticipantAddPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantAddPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantAddPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
