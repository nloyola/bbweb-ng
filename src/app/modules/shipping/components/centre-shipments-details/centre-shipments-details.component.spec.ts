import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentreShipmentsDetailsComponent } from './shipping-centre.component';

describe('CentreShipmentsDetailsComponent', () => {
  let component: CentreShipmentsDetailsComponent;
  let fixture: ComponentFixture<CentreShipmentsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CentreShipmentsDetailsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreShipmentsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
