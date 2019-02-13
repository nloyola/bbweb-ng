import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudyRemoveComponent } from './study-remove.component';
import { Study } from '@app/domain/studies';
import { Factory } from '@test/factory';

describe('StudyRemoveComponent', () => {
  let component: StudyRemoveComponent;
  let fixture: ComponentFixture<StudyRemoveComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule
      ],
      providers: [
        NgbActiveModal
      ],
      declarations: [ StudyRemoveComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyRemoveComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.study = new Study().deserialize(factory.study());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
