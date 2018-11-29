import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeRemoveComponent } from './processing-type-remove.component';

describe('ProcessingTypeRemoveComponent', () => {
  let component: ProcessingTypeRemoveComponent;
  let fixture: ComponentFixture<ProcessingTypeRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingTypeRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
