import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionEventType, Study } from '@app/domain/studies';
import { RootStoreState } from '@app/root-store';
import { EventTypeStoreActions, EventTypeStoreSelectors } from '@app/root-store/event-type';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-event-type-add',
  templateUrl: './event-type-add.component.html',
  styleUrls: ['./event-type-add.component.scss']
})
export class EventTypeAddComponent implements OnInit, OnDestroy {

  @Input() eventType: CollectionEventType;

  study: Study;
  form: FormGroup;

  private eventTypeToSave: CollectionEventType;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.study = this.route.parent.parent.snapshot.data.study;
    if (this.eventType === undefined) {
      this.eventType = new CollectionEventType();
    }

    this.form = this.formBuilder.group({
      name: [ this.eventType.name, [ Validators.required ]],
      description: [ this.eventType.description ],
      recurring: [ this.eventType.recurring ]
    });

    // inform the user when an event type was added
    this.store$
      .pipe(
        select(EventTypeStoreSelectors.selectLastAdded),
        filter(et => !!et),
        takeUntil(this.unsubscribe$))
      .subscribe((eventType: CollectionEventType) => {
        this.toastr.success(
          `EventType was added successfully: ${eventType.name}`,
          'Add Successfull');
        this.store$.dispatch(new EventTypeStoreActions.ClearLastAdded());
        this.navigateToReturnUrl();
      });

    this.store$
      .pipe(
        select(EventTypeStoreSelectors.selectError),
        filter(et => !!et),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        let errMessage = error.error ? error.error.message : error.statusText;
        if (errMessage.match(/EntityCriteriaError.*name already used/)) {
          errMessage = `The name is already in use: ${this.eventTypeToSave.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get name() {
    return this.form.get('name');
  }

  get description() {
    return this.form.get('description');
  }

  get recurring() {
    return this.form.get('recurring');
  }

  onSubmit() {
    this.eventTypeToSave = new CollectionEventType().deserialize(this.form.value);
    this.eventTypeToSave.studyId = this.study.id;
    this.eventTypeToSave.recurring = !!this.eventTypeToSave.recurring;
    this.store$.dispatch(new EventTypeStoreActions.AddEventTypeRequest({
      eventType: this.eventTypeToSave
    }));
  }

  onCancel() {
    this.navigateToReturnUrl();
  }

  private navigateToReturnUrl() {
    this.router.navigate([ '..' ], { relativeTo: this.route });
  }

}
