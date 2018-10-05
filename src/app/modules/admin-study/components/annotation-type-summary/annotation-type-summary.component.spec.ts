import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationTypeSummaryComponent } from './annotation-type-summary.component';

describe('AnnotationTypeSummaryComponent', () => {
  let component: AnnotationTypeSummaryComponent;
  let fixture: ComponentFixture<AnnotationTypeSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationTypeSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTypeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
