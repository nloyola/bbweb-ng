import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnotationTypeRemoveComponent } from './annotation-type-remove.component';
import { AnnotationType } from '@app/domain/annotations';

describe('AnnotationTypeRemoveComponent', () => {
  let component: AnnotationTypeRemoveComponent;
  let fixture: ComponentFixture<AnnotationTypeRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule
      ],
      providers: [
        NgbActiveModal
      ],
      declarations: [ AnnotationTypeRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTypeRemoveComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.annotationType = new AnnotationType();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
