import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleStoreReducer } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { StoreModule } from '@ngrx/store';
import { RolesAdminComponent } from './roles-admin.component';

describe('RolesAdminComponent', () => {
  let component: RolesAdminComponent;
  let fixture: ComponentFixture<RolesAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(
          {
            'role': RoleStoreReducer.reducer
          },
          NgrxRuntimeChecks)
      ],
      declarations: [ RolesAdminComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
