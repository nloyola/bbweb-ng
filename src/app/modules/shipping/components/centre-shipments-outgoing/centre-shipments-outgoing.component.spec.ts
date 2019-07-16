import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentreShipmentsOutgoingComponent } from './centre-shipments-outgoing.component';

describe('CentreShipmentsOutgoingComponent', () => {
  let component: CentreShipmentsOutgoingComponent;
  let fixture: ComponentFixture<CentreShipmentsOutgoingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentreShipmentsOutgoingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreShipmentsOutgoingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
