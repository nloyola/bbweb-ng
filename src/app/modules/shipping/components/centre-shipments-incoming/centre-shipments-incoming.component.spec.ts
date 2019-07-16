import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentreShipmentsIncomingComponent } from './centre-shipments-incoming.component';

describe('CentreShipmentsIncomingComponent', () => {
  let component: CentreShipmentsIncomingComponent;
  let fixture: ComponentFixture<CentreShipmentsIncomingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentreShipmentsIncomingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreShipmentsIncomingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
