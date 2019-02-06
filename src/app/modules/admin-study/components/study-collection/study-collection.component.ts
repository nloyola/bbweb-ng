import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionEventType, Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-study-collection',
  templateUrl: './study-collection.component.html',
  styleUrls: ['./study-collection.component.scss']
})
export class StudyCollectionComponent implements OnInit {

  study$: Observable<Study>;
  eventType: CollectionEventType;
  private modificationsAllowed = false;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.study$ = this.store$
      .pipe(
        select(StudyStoreSelectors.selectAllStudies),
        filter(s => s.length > 0),
        map((entities: Study[]) => {
          const entity = entities.find(s => s.slug === this.route.parent.parent.snapshot.params.slug);
          if (entity) {
            const study = (entity instanceof Study) ? entity :  new Study().deserialize(entity);
            this.modificationsAllowed = study.isDisabled();
            return study;
          }
          return undefined;
        }));
  }

  addEventTypeSelected() {
    if (!this.modificationsAllowed) {
      throw new Error('modifications not allowed');
    }

    this.router.navigate([ '../add' ], { relativeTo: this.route });
    this.eventType = undefined;
  }

  eventTypeSelected(eventType: CollectionEventType) {
    this.router.navigate([ eventType.slug ], { relativeTo: this.route });
  }

}
