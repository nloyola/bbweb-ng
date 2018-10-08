import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationTypeAddComponent } from './annotation-type-add.component';

describe('AnnotationTypeAddComponent', () => {
  let component: AnnotationTypeAddComponent;
  let fixture: ComponentFixture<AnnotationTypeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationTypeAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
