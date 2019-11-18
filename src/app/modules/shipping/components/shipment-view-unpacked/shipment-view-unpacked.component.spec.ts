import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ShipmentStateChange, ShipmentStateTransision } from '@app/core/services';
import { Shipment } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentStoreActions,
  ShipmentStoreReducer
} from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import { ShipmentFixture } from '@test/fixtures/shipment.fixture';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentViewUnpackedComponent } from './shipment-view-unpacked.component';
import { TestUtils } from '@test/utils';
import { of } from 'rxjs';

describe('ShipmentViewUnpackedComponent', () => {
  let component: ShipmentViewUnpackedComponent;
  let fixture: ComponentFixture<ShipmentViewUnpackedComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

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
        },
        {
          provide: Router,
          useValue: {
            url: '/shipping',
            events: of(new NavigationEnd(0, `/shipping/information`, `/shipping/information`)),
            navigate: jest.fn()
          }
        }
      ],
      declarations: [ShipmentViewUnpackedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    const specimenCount = 1;
    shipment = new Shipment().deserialize(factory.shipment({ specimenCount }));
    fixture = TestBed.createComponent(ShipmentViewUnpackedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    ShipmentFixture.updateActivatedRoute(shipment);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when tagging the shipment', () => {
    const context: EntityUpdateComponentBehaviour.Context<ShipmentViewUnpackedComponent> = {};

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => {
        store.dispatch(ShipmentStoreActions.getShipmentSuccess({ shipment }));
      };
      context.componentValidateInitialization = () => undefined;
      context.successAction = ShipmentStoreActions.updateShipmentSuccess({ shipment });
      context.createExpectedFailureAction = error => ShipmentStoreActions.updateShipmentFailure({ error });
      context.duplicateAttibuteValueError = undefined;

      ShipmentFixture.updateActivatedRoute(shipment);
      fixture.detectChanges();
    });

    describe.each`
      tag            | methodName          | transition                           | modalValue    | count
      ${'RECEIVED'}  | ${'backToReceived'} | ${ShipmentStateTransision.Received}  | ${'OK'}       | ${1}
      ${'COMPLETED'} | ${'tagAsCompleted'} | ${ShipmentStateTransision.Completed} | ${new Date()} | ${0}
    `('when tagging a shipment as $tag', ({ methodName, transition, modalValue, count }) => {
      beforeEach(() => {
        shipment = new Shipment().deserialize({
          ...shipment,
          presentSpecimenCount: count
        });
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

  it('cannot be tagged as RECEIVED if specimens have been processed', fakeAsync(() => {
    shipment = new Shipment().deserialize({
      ...shipment,
      specimenCount: 1,
      presentSpecimenCount: 0
    });
    ShipmentFixture.updateActivatedRoute(shipment);
    fixture.detectChanges();

    const modalListener = TestUtils.modalOpenListener('OK');
    const dispatchListner = TestUtils.storeDispatchListener();
    component.backToReceived();
    flush();
    fixture.detectChanges();
    expect(dispatchListner.mock.calls.length).toBe(0);
    expect(modalListener.mock.calls.length).toBe(1);
  }));

  it('cannot be tagged as COMPLETED if specimens have been NOT been processed', fakeAsync(() => {
    shipment = new Shipment().deserialize({
      ...shipment,
      presentSpecimenCount: 1
    });
    ShipmentFixture.updateActivatedRoute(shipment);
    fixture.detectChanges();

    const modalListener = TestUtils.modalOpenListener('OK');
    const dispatchListner = TestUtils.storeDispatchListener();
    component.tagAsCompleted();
    flush();
    fixture.detectChanges();
    expect(dispatchListner.mock.calls.length).toBe(0);
    expect(modalListener.mock.calls.length).toBe(1);
  }));

  it("active tab is initialized from router's event", () => {
    ShipmentFixture.updateActivatedRoute(shipment);
    fixture.detectChanges();
    expect(component.activeTabId).toBe('information');
  });

  it('selecting a tab causes a state navigation', () => {
    ShipmentFixture.updateActivatedRoute(shipment);
    fixture.detectChanges();
    const routerListener = TestUtils.routerNavigateListener();
    const event = { activeId: 'unpacked-specimens', nextId: 'received-specimens', preventDefault: () => {} };
    component.tabSelection(event);
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['received-specimens']);
  });
});
