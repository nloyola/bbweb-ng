import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAddSelectComponent } from './event-add-select.component';

describe('EventAddSelectComponent', () => {
  let component: EventAddSelectComponent;
  let fixture: ComponentFixture<EventAddSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventAddSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAddSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
