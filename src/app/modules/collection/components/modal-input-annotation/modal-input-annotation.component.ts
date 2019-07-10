import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { Annotation } from '@app/domain/annotations';
import { AnnotationsAddSubformComponent } from '@app/modules/collection/components/annotations-add-subform/annotations-add-subform.component';
import { ModalInputOptions } from '@app/modules/modals/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable } from 'rxjs';
import { debounceTime, takeUntil, map, tap, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-modal-input-annotation',
  templateUrl: './modal-input-annotation.component.html',
  styleUrls: ['./modal-input-annotation.component.scss']
})
export class ModalInputAnnotationComponent implements OnInit, OnDestroy {

  @Input() modal: NgbActiveModal;
  @Input() annotation: Annotation;
  @Input() options: ModalInputOptions;

  modalInputValid$: Observable<boolean>;
  form: FormGroup;

  protected validators: ValidatorFn[] = [];
  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(protected formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      annotationsGroup: this.formBuilder.group({
        annotations: AnnotationsAddSubformComponent.buildSubForm([ this.annotation ], this.unsubscribe$)
      })
    });

    this.modalInputValid$ = this.form.valueChanges.pipe(
      debounceTime(300),
      map(() => this.form.valid),
      shareReplay());
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get annotationsGroup(): FormGroup {
    return this.form.get('annotationsGroup') as FormGroup;
  }

  confirm(): void {
    const annotations = AnnotationsAddSubformComponent.valueToAnnotations(this.annotationsGroup);
    if (annotations.length !== 1) {
      throw new Error('there should only be one annotation being modified');
    }
    this.modal.close(annotations[0]);
  }

  dismiss(): void {
    this.modal.dismiss();
  }

}
