import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentAddItemsComponent } from './shipment-add-items-page.component';

describe('ShipmentAddItemsComponent', () => {
  let component: ShipmentAddItemsComponent;
  let fixture: ComponentFixture<ShipmentAddItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentAddItemsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentAddItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
