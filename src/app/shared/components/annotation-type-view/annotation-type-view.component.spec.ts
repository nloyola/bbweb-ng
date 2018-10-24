import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationTypeViewComponent } from './annotation-type-view.component';

describe('AnnotationTypeViewComponent', () => {
  let component: AnnotationTypeViewComponent;
  let fixture: ComponentFixture<AnnotationTypeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationTypeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTypeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
