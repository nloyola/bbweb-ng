import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentAddItemsPageComponent } from './shipment-add-items-page.component';

describe('ShipmentAddItemsPageComponent', () => {
  let component: ShipmentAddItemsPageComponent;
  let fixture: ComponentFixture<ShipmentAddItemsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentAddItemsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentAddItemsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
