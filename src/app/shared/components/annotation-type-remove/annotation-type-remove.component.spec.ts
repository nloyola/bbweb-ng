import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationTypeRemoveComponent } from './annotation-type-remove.component';

describe('AnnotationTypeRemoveComponent', () => {
  let component: AnnotationTypeRemoveComponent;
  let fixture: ComponentFixture<AnnotationTypeRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationTypeRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTypeRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
