import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ShipmentViewPageComponent } from './shipment-view-page.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Centre } from '@app/domain/centres';
import { NgrxRuntimeChecks, ShipmentStoreReducer } from '@app/root-store';
import { StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { Shipment } from '@app/domain/shipments';

describe('ShipmentViewPageComponent', () => {
  let component: ShipmentViewPageComponent;
  let fixture: ComponentFixture<ShipmentViewPageComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [ShipmentViewPageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentViewPageComponent);
    component = fixture.componentInstance;
    shipment = new Shipment().deserialize(factory.shipment());
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
