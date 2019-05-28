import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantViewPageComponent } from './participant-view-page.component';

xdescribe('ParticipantViewPageComponent', () => {
  let component: ParticipantViewPageComponent;
  let fixture: ComponentFixture<ParticipantViewPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantViewPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
