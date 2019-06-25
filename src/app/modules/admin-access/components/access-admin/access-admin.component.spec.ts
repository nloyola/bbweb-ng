import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthStoreReducer } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { StoreModule } from '@ngrx/store';
import { AccessAdminComponent } from './access-admin.component';

describe('AccessAdminComponent', () => {
  let component: AccessAdminComponent;
  let fixture: ComponentFixture<AccessAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(
          {
            'auth': AuthStoreReducer.reducer
          },
          NgrxRuntimeChecks)
      ],
      declarations: [ AccessAdminComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
