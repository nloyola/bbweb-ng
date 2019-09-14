import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipmentAddSpecimensCardComponent } from './shipment-add-specimens-card.component';
import { ShipmentStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { StoreModule } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { Factory } from '@test/factory';
import { Shipment } from '@app/domain/shipments';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('ShipmentAddSpecimensCardComponent', () => {
  let component: ShipmentAddSpecimensCardComponent;
  let fixture: ComponentFixture<ShipmentAddSpecimensCardComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        StoreModule.forRoot(
          {
            shipment: ShipmentStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      declarations: [ShipmentAddSpecimensCardComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentAddSpecimensCardComponent);
    component = fixture.componentInstance;
    component.shipment = shipment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
