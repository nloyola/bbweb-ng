import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationType } from '@app/domain/annotations';
import { NlToBrPipe } from '@app/shared/pipes/nl-to-br.pipe';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TruncateToggleComponent } from '../truncate-toggle/truncate-toggle.component';
import { AnnotationTypeViewComponent } from './annotation-type-view.component';

describe('AnnotationTypeViewComponent', () => {
  let component: AnnotationTypeViewComponent;
  let fixture: ComponentFixture<AnnotationTypeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [AnnotationTypeViewComponent, TruncateToggleComponent, YesNoPipe, NlToBrPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTypeViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.annotationType = new AnnotationType();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
