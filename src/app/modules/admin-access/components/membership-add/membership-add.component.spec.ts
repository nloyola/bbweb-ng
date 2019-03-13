import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { StudyStoreReducer } from '@app/root-store/study';
import { StoreModule } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';
import { MembershipAddComponent } from './membership-add.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MembershipAddComponent', () => {
  let component: MembershipAddComponent;
  let fixture: ComponentFixture<MembershipAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'membership': StudyStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [ MembershipAddComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
