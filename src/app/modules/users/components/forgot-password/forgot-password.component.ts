import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { catchError } from 'rxjs/operators';
import { UserService } from '@app/core/services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  @ViewChild('content') private content;
  forgotForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.forgotForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
      });
  }

  get email() {
    return this.forgotForm.get('email');
  }

  onSubmit() {
    this.userService.passwordReset(this.email)
      .pipe(
        catchError(err => this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result
          .then(() => this.router.navigate(['/'])))
      )
      .subscribe(() => this.router.navigate(['/']));
  }

}
