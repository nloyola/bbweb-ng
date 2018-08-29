import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store, StoreModule, combineReducers } from '@ngrx/store';

import { authReducer } from '@app/root-store/auth-store/auth-store-module-reducer';
import { AuthStoreActions, AuthStoreState } from '@app/root-store/auth-store';
import { StudiesAdminComponent } from './studies-admin.component';

describe('StudiesAdminComponent', () => {
  let store: Store<AuthStoreState.State>;
  let component: StudiesAdminComponent;
  let fixture: ComponentFixture<StudiesAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          'auth': authReducer
        })
      ],
      declarations: [StudiesAdminComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudiesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
