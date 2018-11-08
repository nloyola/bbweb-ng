import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RoleIds } from '@app/domain/access';
import { User } from '@app/domain/users';
import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Factory } from '@app/test/factory';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {

  let store: Store<AuthStoreReducer.State>;
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let ngZone: NgZone;
  let modalService: NgbModal;
  let router: Router;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule.forRoot(),
        RouterTestingModule,
        StoreModule.forRoot({
          'auth': AuthStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        })
      ],
      declarations: [LoginComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    modalService = TestBed.get(NgbModal);
    router = TestBed.get(Router);
    factory = new Factory();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
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

    it('when valid, form is not errored', () => {
      component.email.setValue('test@test.com');
      const errors = component.email.errors || {};
      expect(errors).toEqual({});
    });

  });

  describe('password input validity', () => {

    it('is required', () => {
      const errors = component.password.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when password is valid form is not errored', () => {
      component.password.setValue('test');
      const errors = component.password.errors || {};
      expect(errors).toEqual({});
    });

  });

  describe('when submitting', () => {

    let user;

    beforeEach(() => {
      user = new User().deserialize(factory.user({
        roles: [
          factory.role({ id: RoleIds.SpecimenCollector })
        ]
      }));
    });

    it('on valid login', async(() => {
      spyOn(router, 'navigate').and.callThrough();

      component.email.setValue(user.email);
      component.password.setValue('test');
      component.onSubmit();

      const action = new AuthStoreActions.LoginSuccessAction({ user });
      ngZone.run(() => store.dispatch(action));

      fixture.whenStable().then(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/']);
      });
    }));

    it('and there is a login failure', async(() => {
      const errors = [
        {
          error: {
            status: 401
          }
        },
        {
          error: {
            status: 404,
            message: 'simulated error'
          }
        }
      ];

      spyOn(store, 'dispatch').and.callThrough();
      spyOn(router, 'navigate').and.callThrough();
      spyOn(modalService, 'open').and
        .returnValue({ result: Promise.resolve('OK') });

      const loginClearFailureAction = new AuthStoreActions.LoginClearFailureAction();

      errors.forEach(error => {
        component.email.setValue(user.email);
        component.password.setValue('test');
        component.onSubmit();

        const action = new AuthStoreActions.LoginFailureAction(error);
        ngZone.run(() => store.dispatch(action));

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(modalService.open).toHaveBeenCalled();
          expect(store.dispatch).toHaveBeenCalledWith(loginClearFailureAction);
          expect(router.navigate).toHaveBeenCalledWith(['/']);
        });
      });
    }));

    // this test has to use fakeAsync
    //
    // see https://stackoverflow.com/questions/45502462/angular-unit-test-spyon-not-detecting-my-call
    it('handles close on the modal', fakeAsync(() => {
      spyOn(modalService, 'open').and.returnValue({ result: Promise.reject('Cancel') });
      spyOn(router, 'navigate').and.callThrough();

      const action = new AuthStoreActions.LoginFailureAction({ error: { status: 401 } });
      ngZone.run(() => store.dispatch(action));

      tick();

      expect(modalService.open).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

  });
});
