import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionEventType, Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { Dictionary } from '@ngrx/entity';

@Component({
  selector: 'app-study-collection',
  templateUrl: './study-collection.component.html',
  styleUrls: ['./study-collection.component.scss']
})
export class StudyCollectionComponent implements OnInit, OnDestroy {

  study$: Observable<Study>;
  private studySubject = new BehaviorSubject(null);
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.study$ = this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudyEntities),
      map((studies: Dictionary<Study>) => {
        const studyEntity = studies[this.route.parent.parent.snapshot.data.study.id];
        if (studyEntity) {
          return (studyEntity instanceof Study) ? studyEntity :  new Study().deserialize(studyEntity);
        }
        return undefined;
      }),
      shareReplay());

    this.study$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.studySubject);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addEventTypeSelected() {
    const study = this.studySubject.value;
    if (!study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    this.router.navigate([ '../add' ], { relativeTo: this.route });
  }

  eventTypeSelected(eventType: CollectionEventType) {
    this.router.navigate([ eventType.slug ], { relativeTo: this.route });
  }

}
