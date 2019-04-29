import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationsAddSubformComponent } from './annotations-add-subform.component';

describe('AnnotationsAddSubformComponent', () => {
  let component: AnnotationsAddSubformComponent;
  let fixture: ComponentFixture<AnnotationsAddSubformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationsAddSubformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationsAddSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
