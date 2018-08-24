import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store, StoreModule, combineReducers } from '@ngrx/store';

import { AdminComponent } from './admin.component';
import { authReducer } from '@app/root-store/auth-store/reducer';
import { AuthStoreActions, AuthStoreState } from '@app/root-store/auth-store';

describe('AdminComponent', () => {
  let store: Store<AuthStoreState.State>;
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          'auth': authReducer
        })
      ],
      declarations: [AdminComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    store = TestBed.get(Store);
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
