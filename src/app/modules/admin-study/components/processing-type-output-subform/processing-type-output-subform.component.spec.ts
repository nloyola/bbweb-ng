import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeOutputSubformComponent } from './processing-type-output-subform.component';

describe('ProcessingTypeOutputSubformComponent', () => {
  let component: ProcessingTypeOutputSubformComponent;
  let fixture: ComponentFixture<ProcessingTypeOutputSubformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingTypeOutputSubformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeOutputSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
