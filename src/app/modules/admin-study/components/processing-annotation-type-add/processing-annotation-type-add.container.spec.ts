import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingAnnotationTypeAddComponent } from './processing-annotation-type-add.component';

describe('ProcessingAnnotationTypeAddComponent', () => {
  let component: ProcessingAnnotationTypeAddComponent;
  let fixture: ComponentFixture<ProcessingAnnotationTypeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingAnnotationTypeAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingAnnotationTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
