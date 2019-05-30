import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Annotation, annotationFromType } from '@app/domain/annotations';
import { Participant } from '@app/domain/participants';
import { Study } from '@app/domain/studies';
import { Observable, Subject } from 'rxjs';
import { AnnotationsAddSubformComponent } from '../annotations-add-subform/annotations-add-subform.component';
import { EntityInfo } from '@app/domain';

@Component({
  selector: 'app-participant-add-form',
  templateUrl: './participant-add-form.component.html',
  styleUrls: ['./participant-add-form.component.scss']
})
export class ParticipantAddFormComponent implements OnInit, OnDestroy, OnChanges {

  /* tslint:disable-next-line:no-input-rename */
  @Input('isSaving') isSaving$: Observable<boolean>;

  @Input() studies: Study[];

  /* tslint:disable-next-line:no-input-rename */
  @Input('uniqueId') defaultUniqueId: string;

  @Output() studySelected = new EventEmitter<string>();
  @Output() submitted = new EventEmitter<Participant>();
  @Output() cancelled = new EventEmitter<any>();

  @ViewChild('studySelect') studySelect: ElementRef;

  form: FormGroup;
  selectedStudy: Study;
  annotations: Annotation[];

  private unsubscribe$ = new Subject<void>();

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.studySelect.nativeElement.focus();

    this.form = this.formBuilder.group({
      study: [ '', [ Validators.required ]],
      uniqueId: [ this.defaultUniqueId, [ Validators.required ]],
      annotationsGroup: this.formBuilder.group({ annotations: new FormArray([]) })
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.studies && !changes.studies.firstChange) {
      this.studies = changes.studies.currentValue;
      const study = this.studies.find(s => s.id === this.form.value.study);
      if (study) {
        this.selectedStudy = study;
        this.annotations = study.annotationTypes.map(at => annotationFromType(at));
        this.annotationsGroup.setControl(
          'annotations',
          AnnotationsAddSubformComponent.buildSubForm(this.annotations, this.unsubscribe$));
      }
    }
  }

  get study() {
    return this.form.get('study');
  }

  get uniqueId() {
    return this.form.get('uniqueId');
  }

  get annotationsGroup(): FormGroup {
    return this.form.get('annotationsGroup') as FormGroup;
  }

  studyTrackBy(_index: number, study: Study): string {
    return study.id;
  }

  onStudySelected() {
    this.annotations = [];
    const study = this.studies.find(s => s.id === this.form.value.study);
    if (study !== undefined) {
      this.studySelected.emit(study.slug);
    }
  }

  onSubmit(): void {
    this.submitted.emit(this.formToParticipant());
  }

  onCancel(): void {
    this.cancelled.emit(null);
  }

  private formToParticipant(): Participant {
    const participant = new Participant().deserialize({
      id: undefined,
      uniqueId: this.form.value.uniqueId,
      study: {
        id: this.form.value.study
      }
    } as any);

    participant.annotations = AnnotationsAddSubformComponent.valueToAnnotations(this.annotationsGroup);
    return participant;
  }

}
