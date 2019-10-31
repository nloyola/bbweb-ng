import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipmentViewReceivedComponent } from './shipment-view-sent.component';
import { StoreModule } from '@ngrx/store';
import { ShipmentStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { Factory } from '@test/factory';
import { Shipment } from '@app/domain/shipments';

describe('ShipmentViewReceivedComponent', () => {
  let component: ShipmentViewReceivedComponent;
  let fixture: ComponentFixture<ShipmentViewReceivedComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        StoreModule.forRoot(
          {
            shipment: ShipmentStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [NgbActiveModal],
      declarations: [ShipmentViewReceivedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentViewReceivedComponent);
    component = fixture.componentInstance;
    component.shipment = shipment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
