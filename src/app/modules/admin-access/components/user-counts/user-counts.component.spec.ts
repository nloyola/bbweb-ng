import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCountsComponent } from './user-counts.component';

describe('UserCountsComponent', () => {
  let component: UserCountsComponent;
  let fixture: ComponentFixture<UserCountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
