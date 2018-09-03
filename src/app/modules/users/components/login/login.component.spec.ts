import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from './login.component';
import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { User, UserRole } from '@app/domain/users';
import { RoleIds } from '@app/domain/access';
import { Factory } from '@app/test/factory'

describe('LoginComponent', () => {

  let store: Store<AuthStoreReducer.State>;
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let modalService: NgbModal;
  let router: Router;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule.forRoot(),
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'auth': AuthStoreReducer.reducer
        })
      ],
      declarations: [LoginComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
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

  it('on valid login', () => {
    const user = new User().deserialize(factory.user({
      roles: [
        factory.role({ id: RoleIds.SpecimenCollector })
      ]
    }));
    const action = new AuthStoreActions.LoginSuccessAction({ user });

    spyOn(store, 'dispatch').and.callThrough();
    spyOn(router, 'navigate').and.callThrough();

    store.dispatch(action);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

  it('on login failure', async(() => {
    const errors = [
      {
        error: {
          status: 401,
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
      const action = new AuthStoreActions.LoginFailureAction(error);
      store.dispatch(action);
      expect(modalService.open).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(loginClearFailureAction);

      fixture.whenStable().then(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/']);
      });
    });
  }));
});
