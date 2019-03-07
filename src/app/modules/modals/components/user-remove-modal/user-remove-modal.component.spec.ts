import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRemoveModalComponent } from './user-remove-modal.component';

describe('RoleUserRemoveComponent', () => {
  let component: UserRemoveModalComponent;
  let fixture: ComponentFixture<UserRemoveModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRemoveModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRemoveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
