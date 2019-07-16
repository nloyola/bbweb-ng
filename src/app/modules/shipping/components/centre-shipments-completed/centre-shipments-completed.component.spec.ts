import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentreShipmentsCompletedComponent } from './centre-shipments-completed.component';

describe('CentreShipmentsCompletedComponent', () => {
  let component: CentreShipmentsCompletedComponent;
  let fixture: ComponentFixture<CentreShipmentsCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentreShipmentsCompletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreShipmentsCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
