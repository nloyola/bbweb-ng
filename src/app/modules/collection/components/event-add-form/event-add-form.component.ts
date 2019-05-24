import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CollectionEventType } from '@app/domain/studies';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EventTypeStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Participant } from '@app/domain/participants';

@Component({
  selector: 'app-event-add-form',
  templateUrl: './event-add-form.component.html',
  styleUrls: ['./event-add-form.component.scss']
})
export class EventAddFormComponent implements OnInit {

  participant: Participant;
  eventTypes$: Observable<CollectionEventType[]>;
  form: FormGroup;

  constructor(private store$: Store<RootStoreState.State>,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.participant = this.route.parent.parent.parent.snapshot.data.participant;
    this.form = this.formBuilder.group({});

    this.eventTypes$ = this.store$.pipe(select(EventTypeStoreSelectors.selectAllEventTypes));
  }

}
