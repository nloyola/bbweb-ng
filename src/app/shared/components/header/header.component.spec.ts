import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule, combineReducers } from '@ngrx/store';
import { authReducer } from '@app/root-store/auth-store/reducer';
import { AuthStoreActions, AuthStoreState } from '@app/root-store/auth-store';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { User, UserRole } from '@app/domain/users';
import { RoleIds } from '@app/domain/access';

describe('HeaderComponent', () => {
  let store: Store<AuthStoreState.State>;
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot(),
        RouterTestingModule,
        StoreModule.forRoot({
          'auth': authReducer
        })
      ],
      declarations: [HeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    store = TestBed.get(Store);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);

    spyOn(store, 'dispatch').and.callThrough();
    spyOn(router, 'navigate').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('a dropdown menu item is created with the user`s name', () => {
    const user = new User().deserialize({
      name: 'Random Person',
      roles: [
        new UserRole().deserialize({ id: RoleIds.SpecimenCollector }),
      ]
    });
    const action = new AuthStoreActions.LoginSuccessAction({ user });
    store.dispatch(action);

    fixture.detectChanges();
    const dropdowns = fixture.debugElement.queryAll(By.css('.dropdown'));
    const textContent = dropdowns.map(d => d.nativeElement.textContent).join();
    expect(textContent).toContain(user.name);
  });

  it('calling logout dispatches an action and goes to home state', () => {
    const action = new AuthStoreActions.LogoutRequestAction();
    component.logout();
    expect(store.dispatch).toHaveBeenCalledWith(action);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

});
