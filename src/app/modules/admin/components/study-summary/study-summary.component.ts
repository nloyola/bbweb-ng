import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudyStateUIMap } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { Observable, combineLatest } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { RootStoreState, StudyStoreSelectors, StudyStoreActions } from '@app/root-store';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-study-summary',
  templateUrl: './study-summary.component.html',
  styleUrls: ['./study-summary.component.scss']
})
export class StudySummaryComponent implements OnInit {

  private study: StudyUI;
  private studyStateUIMap = StudyStateUIMap;
  private descriptionToggleLength = 80;
  private isEnableAllowed$: Observable<boolean>;
  private getStateIcon = StudyUI.getStateIcon;
  private getStateIconClass = StudyUI.getStateIconClass;

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.parent.data.subscribe(data =>{
      this.study = new StudyUI(data.study);
      this.store$.dispatch(new StudyStoreActions.GetEnableAllowedRequest({ studyId: this.study.id}));
    });

    this.isEnableAllowed$ =
      combineLatest(
        this.route.parent.data,
        this.store$.pipe(select(StudyStoreSelectors.selectStudyEnableAllowedIds)))
      .pipe(
        map(result => {
          const study = result[0].study;
          const enableAllowedIds = result[1];
          return enableAllowedIds.includes(study.id);
        }));
  }

}
