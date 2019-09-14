import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Shipment } from '@app/domain/shipments';
import { NgrxRuntimeChecks, ShipmentStoreReducer } from '@app/root-store';
import { StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ShipmentViewPackedComponent } from './shipment-view-packed.component';
import { ToastrModule } from 'ngx-toastr';

describe('ShipmentViewPageComponent', () => {
  let component: ShipmentViewPackedComponent;
  let fixture: ComponentFixture<ShipmentViewPackedComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [ShipmentViewPackedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentViewPackedComponent);
    component = fixture.componentInstance;
    shipment = new Shipment().deserialize(factory.shipment());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
