import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ShipmentStateChange, ShipmentStateTransision } from '@app/core/services';
import { Shipment } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentStoreActions,
  ShipmentStoreReducer
} from '@app/root-store';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import { ShipmentFixture } from '@test/fixtures/shipment.fixture';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentViewReceivedComponent } from './shipment-view-received.component';

describe('ShipmentViewReceivedComponent', () => {
  let component: ShipmentViewReceivedComponent;
  let fixture: ComponentFixture<ShipmentViewReceivedComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

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
      providers: [
        NgbActiveModal,
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [ShipmentViewReceivedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentViewReceivedComponent);
    component = fixture.componentInstance;
    ShipmentFixture.updateActivatedRoute(shipment);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when tagging the shipment', () => {
    const context: EntityUpdateComponentBehaviour.Context<ShipmentViewReceivedComponent> = {};

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => {
        store.dispatch(ShipmentStoreActions.getShipmentSuccess({ shipment }));
      };
      context.componentValidateInitialization = () => undefined;
      context.successAction = ShipmentStoreActions.updateShipmentSuccess({ shipment });
      context.createExpectedFailureAction = error => ShipmentStoreActions.updateShipmentFailure({ error });
      context.duplicateAttibuteValueError = undefined;
    });

    describe.each`
      tag           | methodName         | transition                          | modalValue
      ${'SENT'}     | ${'backToSent'}    | ${ShipmentStateTransision.Sent}     | ${'OK'}
      ${'UNPACKED'} | ${'tagAsUnpacked'} | ${ShipmentStateTransision.Unpacked} | ${new Date()}
    `('when tagging a shipment as $tag', ({ methodName, transition, modalValue }) => {
      beforeEach(() => {
        context.modalReturnValue = modalValue;
        context.updateEntity = () => {
          expect(component[methodName]).toBeFunction();
          component[methodName]();
        };

        const value: ShipmentStateChange = { transition };
        if (typeof modalValue !== 'string') {
          value['datetime'] = modalValue;
        }
        context.expectedSuccessAction = ShipmentStoreActions.updateShipmentRequest({
          shipment,
          attributeName: 'state',
          value
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });
  });
});
