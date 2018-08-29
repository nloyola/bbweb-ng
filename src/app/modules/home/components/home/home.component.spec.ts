import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import { authReducer } from '@app/root-store/auth-store/auth-store-module-reducer';
import { AuthStoreActions, AuthStoreState } from '@app/root-store/auth-store';
import { User, UserRole } from '@app/domain/users';
import { RoleIds } from '@app/domain/access';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let store: Store<AuthStoreState.State>;
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          'auth': authReducer
        })
      ],
      declarations: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();

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
    const roles = [
      new UserRole().deserialize({ id: RoleIds.SpecimenCollector }),
      new UserRole().deserialize({ id: RoleIds.ShippingUser }),
      new UserRole().deserialize({ id: RoleIds.ShippingUser }),
      new UserRole().deserialize({ id: RoleIds.StudyAdministrator }),
      new UserRole().deserialize({ id: RoleIds.CentreAdministrator }),
      new UserRole().deserialize({ id: RoleIds.UserAdministrator })
    ];

    roles.forEach(role => {
      const user = new User().deserialize({ roles: [role] });
      const action = new AuthStoreActions.LoginSuccessAction({ user });
      store.dispatch(action);

      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('.card'));
      expect(cards).toBeTruthy();
    });
  });

  it('should display alert if user does not have any roles', function() {
    const user = new User();
    const action = new AuthStoreActions.LoginSuccessAction({ user });
    store.dispatch(action);

    fixture.detectChanges();
    const alert = fixture.debugElement.queryAll(By.css('.alert'));
    expect(alert).toBeTruthy();
  });

});
