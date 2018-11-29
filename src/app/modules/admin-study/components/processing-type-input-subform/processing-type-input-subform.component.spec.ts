import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeInputSubformComponent } from './processing-type-input-subform.component';

describe('ProcessingTypeInputSubformComponent', () => {
  let component: ProcessingTypeInputSubformComponent;
  let fixture: ComponentFixture<ProcessingTypeInputSubformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingTypeInputSubformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeInputSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
