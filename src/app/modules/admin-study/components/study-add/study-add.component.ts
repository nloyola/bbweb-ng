import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-study-add',
  templateUrl: './study-add.component.html',
  styleUrls: ['./study-add.component.scss']
})
export class StudyAddComponent implements OnInit, OnDestroy {

  @ViewChild("nameInput") nameInput: ElementRef;

  form: FormGroup;
  isSaving$: Observable<boolean>;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        name: [ '', [ Validators.required ] ],
        description: ['']
      });

    this.nameInput.nativeElement.focus();

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
        let errMessage = error.payload.error
          ? error.payload.error.error.message : error.payload.error.statusText;
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
    this.router.navigate([ '../' ], { relativeTo: this.route });
  }

}
