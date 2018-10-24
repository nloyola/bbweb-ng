import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypeRemoveComponent } from './event-type-remove.component';

describe('EventTypeRemoveComponent', () => {
  let component: EventTypeRemoveComponent;
  let fixture: ComponentFixture<EventTypeRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventTypeRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTypeRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
