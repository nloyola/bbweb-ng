import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SearchParams } from '@app/domain';
import { Participant } from '@app/domain/participants';
import { CollectionEventType } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AnnotationsAddSubformComponent } from '../annotations-add-subform/annotations-add-subform.component';
import { annotationFromType, Annotation } from '@app/domain/annotations';

@Component({
  selector: 'app-event-add-form',
  templateUrl: './event-add-form.component.html',
  styleUrls: ['./event-add-form.component.scss']
})
export class EventAddFormComponent implements OnInit, OnDestroy {

  participant: Participant;
  eventTypes$: Observable<CollectionEventType[]>;
  annotations: Annotation[];
  form: FormGroup;

  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.participant = this.route.parent.parent.snapshot.data.participant;
    this.form = this.formBuilder.group({
      eventType: [ '', [ Validators.required ]],
      annotationsGroup: this.formBuilder.group({ annotations: new FormArray([]) })
    });

    this.eventTypes$ = this.store$.pipe(
      select(EventTypeStoreSelectors.selectLastNamesSearchEntities),
      tap(eventTypes => {
        if (eventTypes === undefined) { return; }

        const selectedEventType = eventTypes.find(et => et.id === this.form.value.eventType);
        if (selectedEventType) {
          this.annotations = selectedEventType.annotationTypes.map(at => annotationFromType(at));
          this.annotationsGroup.setControl(
            'annotations',
            AnnotationsAddSubformComponent.buildSubForm(this.annotations, this.unsubscribe$));
        }
      }),
      // tap(x => console.log('eventTypes$', x)),
      takeUntil(this.unsubscribe$));

    this.store$.dispatch(EventTypeStoreActions.searchEventTypeNamesRequest({
      studyId: this.participant.study.id,
      searchParams: new SearchParams()
    }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get eventType() {
    return this.form.get('eventType');
  }

  get annotationsGroup(): FormGroup {
    return this.form.get('annotationsGroup') as FormGroup;
  }

  eventTypeTrackBy(_index: number, eventType: CollectionEventType): string {
    return eventType.id;
  }

  onEventTypeSelected() {
    this.store$.dispatch(EventTypeStoreActions.getEventTypeByIdRequest({
      studyId: this.participant.study.id,
      eventTypeId: this.form.value.eventType
    }));
  }

  onSubmit(): void {
  }

  onCancel(): void {
  }

}
