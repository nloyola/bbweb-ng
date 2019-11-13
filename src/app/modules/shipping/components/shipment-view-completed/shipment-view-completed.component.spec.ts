import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Shipment } from '@app/domain/shipments';
import { NgrxRuntimeChecks, ShipmentStoreReducer } from '@app/root-store';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ShipmentFixture } from '@test/fixtures/shipment.fixture';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentViewCompletedComponent } from './shipment-view-completed.component';

describe('ShipmentViewCompletedComponent', () => {
  let component: ShipmentViewCompletedComponent;
  let fixture: ComponentFixture<ShipmentViewCompletedComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      providers: [
        NgbActiveModal,
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [ShipmentViewCompletedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentViewCompletedComponent);
    component = fixture.componentInstance;
    ShipmentFixture.updateActivatedRoute(shipment);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
