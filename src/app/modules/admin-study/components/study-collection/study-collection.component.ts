import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionEventType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, RootStoreState, EventTypeStoreSelectors } from '@app/root-store';
import { Store, select } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-study-collection',
  templateUrl: './study-collection.component.html',
  styleUrls: ['./study-collection.component.scss']
})
export class StudyCollectionComponent implements OnInit, OnDestroy {

  study: Study;
  eventType: CollectionEventType;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.study = this.route.parent.parent.snapshot.data.study;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addEventTypeSelected() {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    this.router.navigate([ 'add' ], { relativeTo: this.route });
    this.eventType = undefined;
  }

  eventTypeSelected(eventType: CollectionEventType) {
    // the selected event type is stored in the NGRX Store so that when the user navigates back to this
    // state, the last selected event type is chosen by default
    this.store$.dispatch(new EventTypeStoreActions.EventTypeSelected({ id: eventType.id }));
  }

}
