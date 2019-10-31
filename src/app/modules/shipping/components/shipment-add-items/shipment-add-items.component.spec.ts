import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShipmentStateChange, ShipmentStateTransision } from '@app/core/services';
import { Shipment } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentStoreActions,
  ShipmentStoreReducer,
  ShipmentSpecimenStoreReducer
} from '@app/root-store';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
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
        StoreModule.forRoot(
          {
            shipment: ShipmentStoreReducer.reducer,
            'shipment-specimen': ShipmentSpecimenStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
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

  // it('sortBy reloads specimens according to selected field', () => {
  //   const dispatchListener = jest.spyOn(store, 'dispatch');
  //   const value = factory.stringNext();

  //   shipment = initializeComponent();
  //   component.sortBy(value);
  //   fixture.detectChanges();

  //   expect(dispatchListener.mock.calls.length).toBe(1);
  //   const expectedAction = ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
  //     shipment,
  //     searchParams: {
  //       sort: value,
  //       page: 1
  //     }
  //   });
  //   expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
  // });

  // it('paginationPageChange reloads specimens according to selected page', () => {
  //   const dispatchListener = jest.spyOn(store, 'dispatch');
  //   const value = 1;

  //   shipment = initializeComponent();
  //   component.paginationPageChange(value);
  //   fixture.detectChanges();

  //   expect(dispatchListener.mock.calls.length).toBe(1);
  //   const expectedAction = ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
  //     shipment,
  //     searchParams: {
  //       sort: '',
  //       page: value
  //     }
  //   });
  //   expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
  // });

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
      const toastrListener = TestUtils.toastrSuccessListener();

      shipment = initializeComponent();
      component.removeShipment();
      flush();
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.removeShipmentSuccess({ shipmentId: shipment.id }));
      flush();
      fixture.detectChanges();

      expect(toastrListener.mock.calls.length).toBe(1);
    }));

    it('infoms the user if there was an error when removing', fakeAsync(() => {
      const toastrListener = TestUtils.toastrErrorListener();

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

      expect(toastrListener.mock.calls.length).toBe(1);
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
    const context: EntityUpdateComponentBehaviour.Context<ShipmentAddItemsComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentValidateInitialization = () => undefined;
      context.dispatchSuccessAction = () => {
        store.dispatch(ShipmentStoreActions.updateShipmentSuccess({ shipment }));
      };
      context.createExpectedFailureAction = error => ShipmentStoreActions.updateShipmentFailure({ error });
      context.duplicateAttibuteValueError = 'xxxx';
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
          context.modalReturnValue = {
            componentInstance: {},
            result: Promise.resolve(modalValue)
          };
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
          context.dispatchSuccessAction = () => {
            store.dispatch(ShipmentStoreActions.updateShipmentSuccess({ shipment }));
          };
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

  function initializeComponent(shipment?: Shipment): Shipment {
    if (!shipment) {
      shipment = new Shipment().deserialize(factory.shipment());
    }
    component.shipment = shipment;
    fixture.detectChanges();
    return shipment;
  }
});
