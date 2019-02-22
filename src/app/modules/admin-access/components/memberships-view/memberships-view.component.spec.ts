import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipsViewComponent } from './memberships-view.component';

describe('MembershipsViewComponent', () => {
  let component: MembershipsViewComponent;
  let fixture: ComponentFixture<MembershipsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembershipsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
