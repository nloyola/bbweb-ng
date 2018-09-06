import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import {
  RootStoreState,
  StudyStoreActions,
  StudyStoreSelectors
} from '@app/root-store';

import { Study } from '@app/domain/studies';

@Component({
  selector: 'app-study-add',
  templateUrl: './study-add.component.html',
  styleUrls: ['./study-add.component.scss']
})
export class StudyAddComponent implements OnInit, OnDestroy {

  private studyForm: FormGroup;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private actions$: Actions,
              private formBuilder: FormBuilder,
              private router: Router,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.studyForm = this.formBuilder.group(
      {
        name: ['', [Validators.required]],
        description: ['']
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get name() {
    return this.studyForm.get('name');
  }

  get description() {
    return this.studyForm.get('description');
  }

  private onSubmit() {
    this.actions$.pipe(
      ofType<StudyStoreActions.AddStudySuccess>(
        StudyStoreActions.StudyActionTypes.AddStudySuccess),
      takeUntil(this.unsubscribe$),
      map(action => action.payload.study),
      tap(study => {
        this.toastr.success(
          `Study was added successfully: ${study.name}`,
          'Add Successfull');
        this.navigateToReturnUrl();
      }))
      .subscribe();

    this.actions$.pipe(
      ofType<StudyStoreActions.AddStudyFailure>(
        StudyStoreActions.StudyActionTypes.AddStudyFailure),
      takeUntil(this.unsubscribe$),
      map(action => action.payload.error.error),
      tap(error => {
        let errMessage;
        if (error.message.match(/EntityCriteriaError: name already used/)) {
          errMessage = `The name is already in use: ${this.studyForm.value.name}`;
        } else {
          errMessage = error.message;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      }))
      .subscribe();

    const study = new Study().deserialize(this.studyForm.value);
    this.store$.dispatch(new StudyStoreActions.AddStudyRequest({ study }));
  }

  private onCancel() {
    this.navigateToReturnUrl();
  }

  private navigateToReturnUrl() {
    this.router.navigate(['/admin/studies']);
  }

}
