import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TruncateToggleComponent } from './truncate-toggle.component';

describe('TruncateToggleComponent', () => {
  let component: TruncateToggleComponent;
  let fixture: ComponentFixture<TruncateToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruncateToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruncateToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
