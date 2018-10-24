import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypesAddAndSelectComponent } from './event-types-add-and-select.component';

describe('EventTypesAddAndSelectComponent', () => {
  let component: EventTypesAddAndSelectComponent;
  let fixture: ComponentFixture<EventTypesAddAndSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventTypesAddAndSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTypesAddAndSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
