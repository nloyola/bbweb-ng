import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationType } from '@app/domain/annotations';
import { TruncatePipe } from '@app/shared/pipes';
import { AnnotationTypeSummaryComponent } from './annotation-type-summary.component';

describe('AnnotationTypeSummaryComponent', () => {
  let component: AnnotationTypeSummaryComponent;
  let fixture: ComponentFixture<AnnotationTypeSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnnotationTypeSummaryComponent, TruncatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTypeSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.annotationType = new AnnotationType();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
