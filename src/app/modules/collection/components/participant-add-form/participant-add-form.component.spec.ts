import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Study } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { ParticipantAddFormComponent } from './participant-add-form.component';

describe('ParticipantAddFormComponent', () => {
  let component: ParticipantAddFormComponent;
  let fixture: ComponentFixture<ParticipantAddFormComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ParticipantAddFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantAddFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    fixture.detectChanges();
    expect(component.form.valid).toBeFalsy();
  });

  describe('study input validity', () => {
    it('is required', () => {
      fixture.detectChanges();
      const errors = component.study.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      fixture.detectChanges();
      component.study.setValue(factory.stringNext());
      const errors = component.study.errors || {};
      expect(errors).toEqual({});
    });
  });

  describe('uniqueId input validity', () => {
    it('is required', () => {
      fixture.detectChanges();
      const errors = component.uniqueId.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      fixture.detectChanges();
      component.uniqueId.setValue(factory.stringNext());
      const errors = component.uniqueId.errors || {};
      expect(errors).toEqual({});
    });
  });

  describe('annotation group is initialized', () => {
    let study: Study;

    beforeEach(() => {
      study = new Study().deserialize(factory.study({ annotationTypes: [factory.annotationType()] }));
    });

    it('empty on initialization', () => {
      fixture.detectChanges();
      expect((component.annotationsGroup.get('annotations') as FormArray).length).toBe(0);
    });

    it('recreated when study is selected', () => {
      component.studies = [study];
      fixture.detectChanges();

      component.form.get('study').setValue(study.id);
      component.ngOnChanges({ studies: new SimpleChange(null, [study], false) });
      fixture.detectChanges();
      expect((component.annotationsGroup.get('annotations') as FormArray).length).toBe(
        study.annotationTypes.length
      );
    });
  });

  describe('when a study is selected', () => {
    let study: Study;

    beforeEach(() => {
      study = new Study().deserialize(factory.study({ annotationTypes: [factory.annotationType()] }));
    });

    it('an event is emitted', () => {
      component.studies = [study];
      fixture.detectChanges();

      let eventProduced = false;
      component.studySelected.subscribe(() => {
        eventProduced = true;
      });

      component.form.get('study').setValue(study.id);
      component.onStudySelected();
      fixture.detectChanges();
      expect(eventProduced).toBe(true);
    });

    it('annotations are emptied', () => {
      component.studies = [study];
      fixture.detectChanges();

      component.form.get('study').setValue(study.id);
      component.ngOnChanges({ studies: new SimpleChange(null, [study], false) });
      fixture.detectChanges();
      expect(component.annotations.length).toBe(1);

      component.onStudySelected();
      fixture.detectChanges();
      expect(component.annotations.length).toBe(0);
    });
  });

  it('pressing submit button emits an event', () => {
    fixture.detectChanges();

    let eventProduced = false;
    component.submitted.subscribe(() => {
      eventProduced = true;
    });

    component.onSubmit();
    fixture.detectChanges();
    expect(eventProduced).toBe(true);
  });

  it('pressing cancel button emits an event', () => {
    fixture.detectChanges();

    let eventProduced = false;
    component.cancelled.subscribe(() => {
      eventProduced = true;
    });

    component.onCancel();
    fixture.detectChanges();
    expect(eventProduced).toBe(true);
  });
});
