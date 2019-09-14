import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipmentViewComponent } from './shipment-view.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { ShipmentStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { Shipment } from '@app/domain/shipments';
import { ActivatedRoute } from '@angular/router';

describe('ShipmentViewComponent', () => {
  let component: ShipmentViewComponent;
  let fixture: ComponentFixture<ShipmentViewComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                shipment
              }
            }
          }
        }
      ],
      declarations: [ShipmentViewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
