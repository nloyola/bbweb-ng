import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RoleIds } from '@app/domain/access';
import { User } from '@app/domain/users';
import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Factory } from '@app/test/factory';
import { Store, StoreModule } from '@ngrx/store';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RegisterComponent } from './register.component';
import { StudyStoreReducer } from '@app/root-store';

describe('RegisterComponent', () => {

  let store: Store<AuthStoreReducer.State>;
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let ngZone: NgZone;
  let router: Router;
  let toastrService: ToastrService;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'auth': AuthStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer,
          'study': StudyStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [RegisterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    toastrService = TestBed.get(ToastrService);
    factory = new Factory();

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
      component.name.setValue('test');
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

  describe('when submitting', () => {

    let user;

    beforeEach(() => {
      user = new User().deserialize(factory.user({
        roles: [
          { id: RoleIds.SpecimenCollector },
        ]
      }));
    });

    it('on valid registration', () => {
      component.name.setValue(user.name);
      component.email.setValue(user.email);
      component.password.setValue('test');
      component.onSubmit();
      spyOn(toastrService, 'success').and.returnValue(null);

      const action = new AuthStoreActions.RegisterSuccessAction({ user });
      ngZone.run(() => store.dispatch(action));
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
        component.name.setValue(user.name);
        component.email.setValue(user.email);
        component.password.setValue('test');
        component.onSubmit();

        const action = new AuthStoreActions.RegisterFailureAction(error);
        ngZone.run(() => store.dispatch(action));
        expect(toastrService.error).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(registerClearFailureAction);
      });
    });

    it('onSubmit dispatches an action', () => {
      const password = 'a random password';

      spyOn(store, 'dispatch').and.callThrough();
      component.name.setValue(user.name);
      component.email.setValue(user.email);
      component.password.setValue(password);

      const action = new AuthStoreActions.RegisterRequestAction({
        name: user.name,
        email: user.email,
        password
      });
      component.onSubmit();
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

  });

  it('onCancel navigates to the home page', () => {
    spyOn(router, 'navigate').and.callThrough();
    ngZone.run(() => component.onCancel());
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
