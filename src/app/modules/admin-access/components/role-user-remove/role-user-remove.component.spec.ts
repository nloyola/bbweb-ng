import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleUserRemoveComponent } from './role-user-remove.component';

describe('RoleUserRemoveComponent', () => {
  let component: RoleUserRemoveComponent;
  let fixture: ComponentFixture<RoleUserRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleUserRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleUserRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
