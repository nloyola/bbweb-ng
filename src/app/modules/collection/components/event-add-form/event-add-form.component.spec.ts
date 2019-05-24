import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAddFormComponent } from './event-add-form.component';

xdescribe('ParticipantAddEventComponent', () => {
  let component: EventAddFormComponent;
  let fixture: ComponentFixture<EventAddFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventAddFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
