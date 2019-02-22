import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipViewComponent } from './membership-view.component';

describe('MembershipViewComponent', () => {
  let component: MembershipViewComponent;
  let fixture: ComponentFixture<MembershipViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembershipViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
