import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeViewComponent } from './processing-type-view.component';

describe('ProcessingTypeViewComponent', () => {
  let component: ProcessingTypeViewComponent;
  let fixture: ComponentFixture<ProcessingTypeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingTypeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
