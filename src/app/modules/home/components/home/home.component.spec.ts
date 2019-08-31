import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RoleIds, UserRole } from '@app/domain/access';
import { User } from '@app/domain/users';
import { RootStoreState, NgrxRuntimeChecks } from '@app/root-store';
import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let store: Store<RootStoreState.State>;
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const factory = new Factory();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(
          {
            auth: AuthStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    store = TestBed.get(Store);

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show not logged in message', function() {
    const rows = fixture.debugElement.queryAll(By.css('.row'));
    expect(rows.length).toBe(1);
  });

  it('should display cards when user has the correct permissions', function() {
    const roleIds = [
      RoleIds.SpecimenCollector,
      RoleIds.ShippingUser,
      RoleIds.ShippingUser,
      RoleIds.StudyAdministrator,
      RoleIds.CentreAdministrator,
      RoleIds.UserAdministrator
    ];

    const roles = roleIds.map(id =>
      new UserRole().deserialize({
        ...factory.userRole(),
        id
      })
    );

    roles.forEach(role => {
      const user = new User().deserialize({
        ...factory.user(),
        roles: [role] as any
      });
      const action = AuthStoreActions.loginSuccessAction({ user });
      store.dispatch(action);

      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('.card'));
      expect(cards).toBeTruthy();
    });
  });

  it('should display alert if user does not have any roles', function() {
    const user = new User();
    const action = AuthStoreActions.loginSuccessAction({ user });
    store.dispatch(action);

    fixture.detectChanges();
    const alert = fixture.debugElement.queryAll(By.css('.alert'));
    expect(alert).toBeTruthy();
  });
});
