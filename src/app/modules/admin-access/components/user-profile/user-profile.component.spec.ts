import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '@app/domain/users';
import { UserStoreActions, UserStoreReducer, RootStoreState } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { ToastrModule } from 'ngx-toastr';
import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  const factory = new Factory();
  let store: Store<RootStoreState.State>;
  let user: User;

  beforeEach(async(() => {
    user = new User().deserialize(factory.user());

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            user: UserStoreReducer.reducer,
            spinner: SpinnerStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                user: user
              },
              params: {
                slug: user.slug
              }
            }
          }
        }
      ],
      declarations: [UserProfileComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('navigates to new path when user name is changed', fakeAsync(() => {
    store.dispatch(UserStoreActions.getUserSuccess({ user }));
    fixture.detectChanges();

    const newNameAndSlug = factory.nameAndSlug();
    const userWithNewName = new User().deserialize({
      ...(user as any),
      ...newNameAndSlug
    });

    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const modalService = TestBed.get(NgbModal);
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newNameAndSlug.name) } as any);
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(UserStoreActions.updateUserSuccess({ user: userWithNewName }));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['..', userWithNewName.slug]);
  }));

  describe('when updating attributes', () => {
    const context: EntityUpdateComponentBehaviour.Context<UserProfileComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => {
        store.dispatch(UserStoreActions.getUserSuccess({ user }));
      };
      context.componentValidateInitialization = () => undefined;
      context.dispatchSuccessAction = () => {
        store.dispatch(UserStoreActions.updateUserSuccess({ user }));
      };
      context.createExpectedFailureAction = error => UserStoreActions.updateUserFailure({ error });
      context.duplicateAttibuteValueError = 'EmailNotAvailable: user with email already exists';
    });

    describe('when updating name', () => {
      beforeEach(() => {
        const newName = factory.stringNext();
        context.modalReturnValue = { result: Promise.resolve(newName) };
        context.updateEntity = () => {
          component.updateName();
        };

        const userWithUpdatedSlug = new User().deserialize({
          ...(user as any),
          slug: factory.slugify(newName),
          name: newName
        });

        context.expectedSuccessAction = UserStoreActions.updateUserRequest({
          user,
          attributeName: 'name',
          value: newName
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(UserStoreActions.updateUserSuccess({ user: userWithUpdatedSlug }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating email', () => {
      beforeEach(() => {
        const newValue = faker.internet.email();
        context.modalReturnValue = { result: Promise.resolve(newValue) };
        context.updateEntity = () => {
          component.updateEmail();
        };
        context.expectedSuccessAction = UserStoreActions.updateUserRequest({
          user,
          attributeName: 'email',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating password', () => {
      beforeEach(() => {
        const newValue = {
          currentPassword: faker.lorem.word(),
          newPassword: faker.lorem.word()
        };
        context.modalReturnValue = { result: Promise.resolve(newValue) };
        context.updateEntity = () => {
          component.updatePassword();
        };
        context.expectedSuccessAction = UserStoreActions.updateUserRequest({
          user,
          attributeName: 'password',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating avatar URL', () => {
      beforeEach(() => {
        const newValue = faker.internet.url();
        context.modalReturnValue = { result: Promise.resolve(newValue) };
        context.updateEntity = () => {
          component.updateAvatarUrl();
        };
        context.expectedSuccessAction = UserStoreActions.updateUserRequest({
          user,
          attributeName: 'avatarUrl',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when a user is ACTIVATED', () => {
      beforeEach(() => {
        const newValue = 'activate';
        context.modalReturnValue = undefined;
        context.updateEntity = () => {
          component.activate();
        };
        context.expectedSuccessAction = UserStoreActions.updateUserRequest({
          user,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when a user is LOCKED', () => {
      beforeEach(() => {
        const newValue = 'lock';
        context.modalReturnValue = undefined;
        context.updateEntity = () => {
          component.lock();
        };
        context.expectedSuccessAction = UserStoreActions.updateUserRequest({
          user,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when a user is UNLOCKED', () => {
      beforeEach(() => {
        const newValue = 'unlock';
        context.modalReturnValue = undefined;
        context.updateEntity = () => {
          component.unlock();
        };
        context.expectedSuccessAction = UserStoreActions.updateUserRequest({
          user,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });
  });
});
