import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Role } from '@app/domain/access';
import { User } from '@app/domain/users';
import { RoleStoreActions, RoleStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule } from 'ngx-toastr';
import { RoleViewComponent } from './role-view.component';
import { EntityWithSubEntityBehaviour } from '@test/behaviours/entity-with-sub-entity.behaviour';

// (nl-recompile-mode 1)

describe('RoleViewComponent', () => {
  let component: RoleViewComponent;
  let fixture: ComponentFixture<RoleViewComponent>;
  const factory = new Factory();
  let role: Role;
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    role = new Role().deserialize(factory.role());

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'role': RoleStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
                params: {
                  slug: role.slug
                }
            }
          }
        }
      ],
      declarations: [ RoleViewComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(RoleViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when adding and removing a user', () => {

    let baseContext: EntityWithSubEntityBehaviour.BaseContext = {} as any;

    beforeEach(() => {
      baseContext = {
        dispatchParentEntity: (): void => {
          store.dispatch(new RoleStoreActions.GetRoleSuccess({ role }));
          fixture.detectChanges();
        },
        dispatchUpdatedParentEntity: (): void => {
          store.dispatch(new RoleStoreActions.UpdateRoleSuccess({ role }));
          fixture.detectChanges();
        },
        dispatchUpdatedParentEntityWithError: (error: any): void => {
          store.dispatch(new RoleStoreActions.UpdateRoleFailure({ error }));
          fixture.detectChanges();
        },
        modalReturnValue: {
          componentInstance: {},
          result: Promise.resolve(true)
        }
      };
    });

    const user = new User().deserialize(factory.user());

    describe('when adding', () => {

      const context: EntityWithSubEntityBehaviour.AddContext = {} as any;

      beforeEach(() => {
        Object.assign(context, baseContext, {
          addChildEntity: () => {
            component.userAddTypeahead.selected$.next(user);
            fixture.detectChanges();
          },
          checkAddUpdateRequest: (storeListener: any) => {
            expect(storeListener.mock.calls.length).toBe(1);
            expect(storeListener.mock.calls[0][0])
              .toEqual(new RoleStoreActions.UpdateRoleRequest({
                role,
                attributeName: 'userAdd',
                value: user.id
              }));
          }
        });
      });

      EntityWithSubEntityBehaviour.addSharedBehaviour(context);
    });

    describe('when removing', () => {

      const context: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

      beforeEach(() => {
        Object.assign(context, baseContext, {
          removeChildEntity: () => {
            component.userSelected(user);
            fixture.detectChanges();
          },
          checkRemoveUpdateRequest: (storeListener: any) => {
            expect(storeListener.mock.calls.length).toBe(1);
            expect(storeListener.mock.calls[0][0]).toEqual(new RoleStoreActions.UpdateRoleRequest({
              role,
              attributeName: 'userRemove',
              value: user.id
            }));
          }
        });
      });

      EntityWithSubEntityBehaviour.removeSharedBehaviour(context);
    });

  });
});
