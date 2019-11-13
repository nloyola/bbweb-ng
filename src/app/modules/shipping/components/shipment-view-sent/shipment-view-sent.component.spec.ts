import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Shipment } from '@app/domain/shipments';
import { NgrxRuntimeChecks, ShipmentStoreReducer } from '@app/root-store';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ShipmentFixture } from '@test/fixtures/shipment.fixture';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentViewSentComponent } from './shipment-view-sent.component';

describe('ShipmentViewSentComponent', () => {
  let component: ShipmentViewSentComponent;
  let fixture: ComponentFixture<ShipmentViewSentComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            shipment: ShipmentStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        NgbActiveModal,
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [ShipmentViewSentComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentViewSentComponent);
    component = fixture.componentInstance;
    ShipmentFixture.updateActivatedRoute(shipment);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
