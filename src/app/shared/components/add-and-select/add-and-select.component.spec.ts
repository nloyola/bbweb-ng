import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAndSelectComponent } from './add-and-select.component';

describe('AddAndSelectComponent', () => {
  let component: AddAndSelectComponent;
  let fixture: ComponentFixture<AddAndSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAndSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAndSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
