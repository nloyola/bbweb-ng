import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Shipment } from '@app/domain/shipments';
import { NgrxRuntimeChecks, ShipmentStoreReducer } from '@app/root-store';
import { LocalTimePipe } from '@app/shared/pipes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentInformationCardComponent } from './shipment-information-card.component';

describe('ShipmentInformationCardComponent', () => {
  let component: ShipmentInformationCardComponent;
  let fixture: ComponentFixture<ShipmentInformationCardComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      declarations: [ShipmentInformationCardComponent, LocalTimePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentInformationCardComponent);
    component = fixture.componentInstance;
    component.shipment = shipment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
