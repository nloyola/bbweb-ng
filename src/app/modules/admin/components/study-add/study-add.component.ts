import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { catchError, filter, map, takeUntil, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import {
  RootStoreState,
  StudyStoreActions,
  StudyStoreSelectors
} from '@app/root-store';

import { Study } from '@app/domain/studies';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';

@Component({
  selector: 'app-study-add',
  templateUrl: './study-add.component.html',
  styleUrls: ['./study-add.component.scss']
})
export class StudyAddComponent implements OnInit, OnDestroy {

  form: FormGroup;

  private unsubscribe$: Subject<void> = new Subject<void>();
  private isSaving$: Observable<boolean>;

  constructor(private store$: Store<RootStoreState.State>,
              private formBuilder: FormBuilder,
              private router: Router,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        name: ['', [Validators.required]],
        description: ['']
      });

    this.isSaving$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectStudyLastAdded),
        filter(s => !!s),
        takeUntil(this.unsubscribe$))
      .subscribe((s: Study) => {
        this.toastr.success(
          `Study was added successfully: ${s.name}`,
          'Add Successfull');
        this.navigateToReturnUrl();
      });

    this.store$
      .pipe(
        select(StudyStoreSelectors.selectStudyError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        let errMessage = error.error ? error.error.message : error.statusText;
        if (errMessage.match(/EntityCriteriaError: name already used/)) {
          errMessage = `The name is already in use: ${this.form.value.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get name() {
    return this.form.get('name');
  }

  get description() {
    return this.form.get('description');
  }

  onSubmit() {
    const study = new Study().deserialize(this.form.value);
    this.store$.dispatch(new StudyStoreActions.AddStudyRequest({ study }));
  }

  onCancel() {
    this.navigateToReturnUrl();
  }

  private navigateToReturnUrl() {
    this.router.navigate(['/admin/studies']);
  }

}
