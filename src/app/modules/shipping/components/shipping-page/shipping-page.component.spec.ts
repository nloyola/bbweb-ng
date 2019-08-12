import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RoleIds } from '@app/domain/access';
import { Centre } from '@app/domain/centres';
import { User } from '@app/domain/users';
import {
  AuthStoreActions,
  AuthStoreReducer,
  CentreStoreActions,
  CentreStoreReducer,
  NgrxRuntimeChecks,
  RootStoreState
} from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ShippingPageComponent } from './shipping-page.component';
import { RouterTestingModule } from '@angular/router/testing';

interface EntitiesOptions {
  user?: User;
  centre?: Centre;
}

describe('ShippingPageComponent', () => {
  let component: ShippingPageComponent;
  let fixture: ComponentFixture<ShippingPageComponent>;
  let store: Store<RootStoreState.State>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        RouterTestingModule,
        StoreModule.forRoot(
          {
            centre: CentreStoreReducer.reducer,
            auth: AuthStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [ShippingPageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
