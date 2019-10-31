import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Centre } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-centre-add',
  templateUrl: './centre-add.component.html',
  styleUrls: ['./centre-add.component.scss']
})
export class CentreAddComponent implements OnInit, OnDestroy {
  @ViewChild('nameInput', { static: true }) nameInput: ElementRef;

  form: FormGroup;
  isSaving$ = new BehaviorSubject<boolean>(false);

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['']
    });

    this.nameInput.nativeElement.focus();

    this.store$
      .pipe(
        select(CentreStoreSelectors.selectCentreLastAdded),
        filter(s => !!s),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((centre: Centre) => {
        this.toastr.success(`Centre was added successfully: ${centre.name}`, 'Add Successfull');
        this.router.navigate(['..', centre.slug], { relativeTo: this.route });
        this.isSaving$.next(false);
      });

    this.store$
      .pipe(
        select(CentreStoreSelectors.selectCentreError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error: any) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage.match(/EntityCriteriaError: centre with name already exists/)) {
          errMessage = `The name is already in use: ${this.form.value.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
        this.isSaving$.next(false);
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
    const centre = new Centre().deserialize(this.form.value);
    this.store$.dispatch(CentreStoreActions.addCentreRequest({ centre }));
    this.isSaving$.next(true);
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
