import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Shipment } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  ShipmentStoreActions,
  ShipmentStoreReducer,
  RootStoreState
} from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentAddSpecimensCardComponent } from './shipment-add-specimens-card.component';

describe('ShipmentAddSpecimensCardComponent', () => {
  let component: ShipmentAddSpecimensCardComponent;
  let fixture: ComponentFixture<ShipmentAddSpecimensCardComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

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
    store = TestBed.get(Store);
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentAddSpecimensCardComponent);
    component = fixture.componentInstance;
    component.shipment = shipment;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('emits an event when the user add specimens', () => {
    fixture.detectChanges();

    let eventProduced = false;
    component.onAction.subscribe(() => {
      eventProduced = true;
    });
    const inventoryIds = factory.stringNext();
    component.form.get('inventoryIds').setValue(inventoryIds);
    component.onSubmit();
    expect(eventProduced).toBe(true);
  });

  it('input field is cleared when shipment is updated', () => {
    fixture.detectChanges();

    const inventoryIds = factory.stringNext();
    component.form.get('inventoryIds').setValue(inventoryIds);

    store.dispatch(ShipmentStoreActions.getShipmentSuccess({ shipment }));
    fixture.detectChanges();
    expect(component.form.get('inventoryIds').value).toBe('');
    expect(component.form.untouched).toBe(true);
  });

  it('when there is a shipment store error', () => {
    fixture.detectChanges();

    component.form.get('inventoryIds').setValue(factory.stringNext());
    component.onSubmit();
    expect(component.shipmentLoading).toBe(true);

    store.dispatch(
      ShipmentStoreActions.getShipmentFailure({
        error: {
          message: 'simulated error'
        }
      })
    );
    fixture.detectChanges();
    expect(component.shipmentLoading).toBe(false);
  });
});
