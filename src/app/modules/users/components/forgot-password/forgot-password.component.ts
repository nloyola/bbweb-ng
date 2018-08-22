import { Component, ViewChild } from '@angular/core';
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
  email: string = '';
  closeResult: string;

  constructor(private userService: UserService,
    private router: Router,
    private modalService: NgbModal) { }

  submitForm(values) {
    this.userService.passwordReset(values.email)
      .pipe(
        catchError(err => this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result
          .then(() => this.router.navigate(['/'])))
      )
      .subscribe(() => this.router.navigate(['/']));
  }

}
