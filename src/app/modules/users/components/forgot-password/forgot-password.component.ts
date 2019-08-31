import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@app/core/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of as observableOf } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild('successModal', { static: true }) successModal: ElementRef;
  @ViewChild('failureModal', { static: true }) failureModal: ElementRef;
  forgotForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotForm.get('email');
  }

  onSubmit() {
    this.userService
      .passwordReset(this.forgotForm.value.email)
      .pipe(
        map(() => this.successModal),
        catchError(() => observableOf(this.failureModal))
      )
      .subscribe(modal => {
        this.modalService
          .open(modal, { ariaLabelledBy: 'modal-basic-title' })
          .result.then(() => this.router.navigate(['/']));
      });
  }
}
