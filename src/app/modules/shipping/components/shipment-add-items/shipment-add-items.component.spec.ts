import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ShipmentStateChange, ShipmentStateTransision } from '@app/core/services';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentSpecimenStoreReducer,
  ShipmentStoreActions,
  ShipmentStoreReducer
} from '@app/root-store';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import { ShipmentSpecimensFixture } from '@test/fixtures/shipment-specimens.fixture';
import { ShipmentFixture } from '@test/fixtures/shipment.fixture';
import { TestUtils } from '@test/utils';
import { ToastrModule } from 'ngx-toastr';
import { ModalShipmentHasNoSpecimensComponent } from '../modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalShipmentHasSpecimensComponent } from '../modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ShipmentAddItemsComponent } from './shipment-add-items.component';

describe('ShipmentAddItemsComponent', () => {
  let component: ShipmentAddItemsComponent;
  let fixture: ComponentFixture<ShipmentAddItemsComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            shipment: ShipmentStoreReducer.reducer,
            'shipment-specimen': ShipmentSpecimenStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [ShipmentAddItemsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(ShipmentAddItemsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    initializeComponent();
    expect(component).toBeTruthy();
  });

  describe('when removing a shipment', () => {
    let modalListener: jest.MockInstance<void, any[]>;
    let dispatchListener: jest.MockInstance<void, any[]>;

    beforeEach(() => {
      const modalService = TestBed.get(NgbModal);
      modalListener = jest.spyOn(modalService, 'open').mockReturnValue({
        result: Promise.resolve('OK')
      });
      dispatchListener = jest.spyOn(store, 'dispatch');
    });

    it('dispatches the remove action', fakeAsync(() => {
      shipment = initializeComponent();
      component.removeShipment();
      flush();
      fixture.detectChanges();

      expect(modalListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(
        ShipmentStoreActions.removeShipmentRequest({ shipment })
      );
    }));

    it('infoms the user if the shipment was removed', fakeAsync(() => {
      const notificationListener = TestUtils.notificationShowListener();

      shipment = initializeComponent();
      component.removeShipment();
      flush();
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.removeShipmentSuccess({ shipmentId: shipment.id }));
      flush();
      fixture.detectChanges();

      expect(notificationListener.mock.calls.length).toBe(1);
    }));

    it('infoms the user if there was an error when removing', fakeAsync(() => {
      const notificationListener = TestUtils.notificationShowErrorListener();

      initializeComponent();
      component.removeShipment();
      flush();
      fixture.detectChanges();

      store.dispatch(
        ShipmentStoreActions.removeShipmentFailure({
          error: {
            error: {
              message: 'simulated error'
            }
          }
        })
      );
      flush();
      fixture.detectChanges();

      expect(notificationListener.mock.calls.length).toBe(1);
    }));

    it('opens a modal informing the user if the shipment contains specimens', fakeAsync(() => {
      initializeComponent(new Shipment().deserialize(factory.shipment({ specimenCount: 1 })));
      component.removeShipment();
      flush();
      fixture.detectChanges();

      expect(modalListener.mock.calls.length).toBe(1);
      expect(modalListener.mock.calls[0][0]).toBe(ModalShipmentHasSpecimensComponent);
      expect(dispatchListener.mock.calls.length).toBe(0);
    }));
  });

  describe('when tagging shipments', () => {
    const context: EntityUpdateComponentBehaviour.Context<ShipmentAddItemsComponent> = {};

    beforeEach(() => {
      context.fixture = fixture;
      context.componentValidateInitialization = () => undefined;
      context.createExpectedFailureAction = error => ShipmentStoreActions.updateShipmentFailure({ error });
      context.duplicateAttibuteValueError = undefined;
    });

    describe.each`
      methodName       | transition                            | modalValue
      ${'tagAsPacked'} | ${ShipmentStateTransision.Packed}     | ${new Date()}
      ${'tagAsSent'}   | ${ShipmentStateTransision.SkipToSent} | ${[new Date(), new Date()]}
    `('when tagging a shipment as $methodName', ({ methodName, transition, modalValue }) => {
      describe('when the shipment contains specimens', () => {
        beforeEach(() => {
          shipment = new Shipment().deserialize(factory.shipment({ specimenCount: 1 }));

          context.componentInitialize = () => {
            store.dispatch(ShipmentStoreActions.getShipmentSuccess({ shipment }));
            initializeComponent(shipment);
          };
          context.successAction = ShipmentStoreActions.updateShipmentSuccess({ shipment });
          context.modalReturnValue = modalValue;
          context.updateEntity = () => {
            expect(component[methodName]).toBeFunction();
            component[methodName]();
          };

          const value: ShipmentStateChange = { transition };
          if (Array.isArray(modalValue)) {
            value['datetime'] = modalValue[0];
            value['skipDatetime'] = modalValue[1];
          } else {
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

      it('when the shipment does not contain specimens a modal opens informing the user', fakeAsync(() => {
        const modalService = TestBed.get(NgbModal);
        const modalListener = jest.spyOn(modalService, 'open').mockReturnValue({
          componentInstance: {},
          result: Promise.resolve(modalValue)
        });
        const dispatchListener = jest.spyOn(store, 'dispatch');

        shipment = initializeComponent(new Shipment().deserialize(factory.shipment({ specimenCount: 0 })));
        expect(component[methodName]).toBeFunction();
        component[methodName]();
        flush();
        fixture.detectChanges();

        expect(modalListener.mock.calls.length).toBe(1);
        expect(modalListener.mock.calls[0][0]).toBe(ModalShipmentHasNoSpecimensComponent);
        expect(dispatchListener.mock.calls.length).toBe(0);
      }));
    });
  });

  describe('when component is informed by child that the shipment has been updated', () => {
    it('when update is happening, blocking progress is shown', () => {
      initializeComponent();
      const spyListener = TestUtils.blockingProgressShowListener();
      component.shipmentChange(true);
      expect(spyListener.mock.calls.length).toBe(1);
    });

    it('when update completes, blocking progress is hidden', () => {
      initializeComponent();
      const spyListener = TestUtils.blockingProgressHideListener();
      component.shipmentChange(false);
      expect(spyListener.mock.calls.length).toBe(1);
    });
  });

  describe('when a specimen is added', () => {
    it('action is dispatched', () => {
      shipment = initializeComponent();
      const specimenInventoryIds = [factory.stringNext()];
      const dispatchListener = TestUtils.storeDispatchListener();
      const blockingListener = TestUtils.blockingProgressShowListener();
      component.addShipmentSpecimens(specimenInventoryIds);
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(
        ShipmentStoreActions.addSpecimensRequest({
          shipment,
          specimenInventoryIds
        })
      );
      expect(blockingListener.mock.calls.length).toBe(1);
    });
  });

  describe('for shipment specimen events', () => {
    it('when an invalid event is received', () => {
      const action = factory.stringNext();
      initializeComponent();
      const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      expect(() => {
        component.shipmentSpecimenEvent([shipmentSpecimen, action]);
      }).toThrowError(`event ${action} is invalid`);
    });

    describe('when a specimen is removed', () => {
      it('action is dispatched', fakeAsync(() => {
        shipment = initializeComponent();
        const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
        const modalListener = TestUtils.modalOpenListener();
        const dispatchListener = TestUtils.storeDispatchListener();
        const blockingListener = TestUtils.blockingProgressShowListener();
        component.shipmentSpecimenEvent([shipmentSpecimen, 'remove']);
        expect(modalListener.mock.calls.length).toBe(1);

        flush();
        fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        expect(dispatchListener.mock.calls[0][0]).toEqual(
          ShipmentStoreActions.removeSpecimenRequest({
            shipment,
            shipmentSpecimen
          })
        );
        expect(blockingListener.mock.calls.length).toBe(1);
      }));

      it('notifies the user of the removal', fakeAsync(() => {
        shipment = initializeComponent();
        const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
        const modalListener = TestUtils.modalOpenListener();
        component.shipmentSpecimenEvent([shipmentSpecimen, 'remove']);
        expect(modalListener.mock.calls.length).toBe(1);

        flush();
        fixture.detectChanges();

        const notificationListener = TestUtils.notificationShowListener();
        const blockingListener = TestUtils.blockingProgressHideListener();
        store.dispatch(ShipmentStoreActions.removeSpecimenSuccess({ shipment }));
        flush();
        fixture.detectChanges();
        expect(notificationListener.mock.calls.length).toBe(1);
        expect(blockingListener.mock.calls.length).toBe(1);
      }));

      describe.each(ShipmentSpecimensFixture.errors)(
        'informs the user there was a "%s" error',
        (_errMessage, error) => {
          it('shows the error in a modal', fakeAsync(() => {
            shipment = initializeComponent();
            const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
            const modalListener = TestUtils.modalOpenListener();
            const blockingListener = TestUtils.blockingProgressHideListener();
            component.shipmentSpecimenEvent([shipmentSpecimen, 'remove']);
            expect(modalListener.mock.calls.length).toBe(1);

            flush();
            fixture.detectChanges();

            modalListener.mockClear();
            store.dispatch(ShipmentStoreActions.removeSpecimenFailure({ error }));
            flush();
            fixture.detectChanges();
            expect(modalListener.mock.calls.length).toBe(1);
            expect(blockingListener.mock.calls.length).toBe(1);
          }));
        }
      );
    });
  });

  function initializeComponent(shipment?: Shipment): Shipment {
    if (!shipment) {
      shipment = new Shipment().deserialize(factory.shipment());
    }
    ShipmentFixture.updateActivatedRoute(shipment);
    fixture.detectChanges();
    return shipment;
  }
});
