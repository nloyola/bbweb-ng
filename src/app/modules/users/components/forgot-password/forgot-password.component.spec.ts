import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '@app/core/services';
import { User } from '@app/domain/users';
import { Factory } from '@test/factory';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {

  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let httpMock: HttpTestingController;
  let ngZone: NgZone;
  let service: UserService;
  let router: Router;
  let modalService: NgbModal;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        NgbModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      declarations: [ForgotPasswordComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    httpMock = TestBed.get(HttpTestingController);
    ngZone = TestBed.get(NgZone);
    service = TestBed.get(UserService);
    router = TestBed.get(Router);
    modalService = TestBed.get(NgbModal);
    factory = new Factory();

    ngZone.run(() => router.initialNavigation());
    spyOn(router, 'navigate').and.callThrough();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.forgotForm.valid).toBeFalsy();
  });

  describe('email input validity', () => {

    it('is required', () => {
      const errors = component.email.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when invalid is errored', () => {
      component.email.setValue('test');
      const errors = component.email.errors || {};
      expect(errors['email']).toBeTruthy();
    });

    it('when valid is not errored', () => {
      component.email.setValue('test@test.com');
      const errors = component.email.errors || {};
      expect(errors).toEqual({});
    });

  });

  describe('when submitted', () => {

    it('form submission sends a request to the server', async(() => {
      const user = new User().deserialize(factory.user());
      spyOn(modalService, 'open').and
        .returnValue({ result: Promise.resolve('OK') });

      component.email.setValue(user.email);
      component.onSubmit();

      const req = httpMock.expectOne(`${service.BASE_URL}/passreset`);
      expect(req.request.method).toBe('POST');
      ngZone.run(() => req.flush(user));

      fixture.whenStable().then(() => {
        expect(modalService.open).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/']);
      });
    }));

    it('a error reply from the server causes a modal to be shown', async(() => {
      spyOn(modalService, 'open').and
        .returnValue({ result: Promise.resolve('OK') });

      component.email.setValue('test@test.com');
      component.onSubmit();

      const req = httpMock.expectOne(`${service.BASE_URL}/passreset`);
      expect(req.request.method).toBe('POST');
      ngZone.run(() => req.flush('simulated error', { status: 400, statusText: 'error' }));

      fixture.whenStable().then(() => {
        expect(modalService.open).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/']);
      });
    }));

  });
});
