import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeCardComponent } from './processing-type-card.component';

describe('ProcessingTypeCardComponent', () => {
  let component: ProcessingTypeCardComponent;
  let fixture: ComponentFixture<ProcessingTypeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingTypeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
