import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ToastrModule, ToastrService } from 'ngx-toastr';

import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { RegisterComponent } from './register.component';
import { User, UserRole } from '@app/domain/users';
import { RoleIds } from '@app/domain/access';

describe('RegisterComponent', () => {

  let store: Store<AuthStoreReducer.State>;
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  let toastrService: ToastrService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'auth': AuthStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [RegisterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    toastrService = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  describe('name input validity', () => {

    it('is required', () => {
      const errors = component.name.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      component.name.setValue("test");
      const errors = component.name.errors || {};
      expect(errors).toEqual({});
    });

  });

  describe('email input validity', () => {

    it('is required', () => {
      const errors = component.email.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when invalid is errored', () => {
      component.email.setValue("test");
      const errors = component.email.errors || {};
      expect(errors['email']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      component.email.setValue("test@test.com");
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
      component.password.setValue("test");
      const errors = component.password.errors || {};
      expect(errors).toEqual({});
    });

  });

  describe('confirmPassword input validity', () => {

    it('is required', () => {
      const errors = component.confirmPassword.errors || {};
      expect(errors['passwordsNonMatching']).toBeTruthy();
    });

    it('when password and confirm password do not match', () => {
      const value = 'test';
      component.password.setValue(value);
      component.confirmPassword.setValue(value + 'xxxx');
      const errors = component.confirmPassword.errors || {};
      expect(errors['passwordsNonMatching']).toBeTruthy();
    });

    it('when confirm password is valid form is not errored', () => {
      const validValue = 'test';
      component.password.setValue(validValue);
      component.confirmPassword.setValue(validValue);
      const errors = component.confirmPassword.errors || {};
      expect(errors).toEqual({});
    });

  });

  it('on valid registration', () => {
    const user = new User().deserialize({
      name: 'Random Person',
      roles: [
        new UserRole().deserialize({ id: RoleIds.SpecimenCollector }),
      ]
    });
    const action = new AuthStoreActions.RegisterSuccessAction({ user });

    spyOn(toastrService, 'success').and.returnValue(null);
    store.dispatch(action);
    expect(toastrService.success).toHaveBeenCalled();
  });

  it('on registration failure', () => {
    const errors = [
      {
        error: {
          status: 403,
          error: {
            message: 'email already registered'
          }
        }
      },
      {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
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
    spyOn(toastrService, 'error').and.returnValue(null);
    const registerClearFailureAction = new AuthStoreActions.RegisterClearFailureAction();

    errors.forEach(error => {
      const action = new AuthStoreActions.RegisterFailureAction(error);
      store.dispatch(action);
      expect(toastrService.error).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(registerClearFailureAction);
    });
  });

  it('onSubmit dispatches an action', () => {
    const user = {
      name: 'Random User',
      email: 'test@test.com',
      password: 'a random password'
    };

    spyOn(store, 'dispatch').and.callThrough();
    component.name.setValue(user.name);
    component.email.setValue(user.email);
    component.password.setValue(user.password);

    const action = new AuthStoreActions.RegisterRequestAction(user);
    component.onSubmit();
    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

  it('onCancel navigates to the home page', () => {
    spyOn(router, 'navigate').and.callThrough();
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
