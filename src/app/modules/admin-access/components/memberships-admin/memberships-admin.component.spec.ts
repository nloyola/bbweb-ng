import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MembershipStoreReducer } from '@app/root-store';
import { StoreModule } from '@ngrx/store';
import { MembershipsAdminComponent } from './memberships-admin.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('MembershipsAdminComponent', () => {
  let component: MembershipsAdminComponent;
  let fixture: ComponentFixture<MembershipsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          'membership': MembershipStoreReducer.reducer
        })
      ],
      declarations: [ MembershipsAdminComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
