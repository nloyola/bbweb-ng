import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AccessAdminComponent } from './access-admin.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { AuthStoreReducer } from '@app/root-store';

describe('AccessAdminComponent', () => {
  let component: AccessAdminComponent;
  let fixture: ComponentFixture<AccessAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          'auth': AuthStoreReducer.reducer
        })
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
