import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Shipment } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  ShipmentStoreReducer,
  ShipmentStoreActions,
  RootStoreState
} from '@app/root-store';
import { LocalTimePipe } from '@app/shared/pipes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule, Store } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentInformationCardComponent } from './shipment-information-card.component';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Centre, CentreLocationInfo } from '@app/domain/centres';

describe('ShipmentInformationCardComponent', () => {
  let component: ShipmentInformationCardComponent;
  let fixture: ComponentFixture<ShipmentInformationCardComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

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
    store = TestBed.get(Store);
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentInformationCardComponent);
    component = fixture.componentInstance;
    component.shipment = shipment;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when updating attributes', () => {
    const context: EntityUpdateComponentBehaviour.Context<ShipmentInformationCardComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => {
        store.dispatch(ShipmentStoreActions.getShipmentSuccess({ shipment }));
      };
      context.componentValidateInitialization = () => undefined;
      context.dispatchSuccessAction = () => {
        store.dispatch(ShipmentStoreActions.updateShipmentSuccess({ shipment }));
      };
      context.createExpectedFailureAction = error => ShipmentStoreActions.updateShipmentFailure({ error });
      context.duplicateAttibuteValueError =
        'EntityCriteriaError: shipment with tracking number already exists';
    });

    describe('when updating courier name', () => {
      beforeEach(() => {
        const newName = factory.stringNext();
        context.modalReturnValue = { result: Promise.resolve(newName) };
        context.updateEntity = () => {
          component.updateCourier();
        };

        context.expectedSuccessAction = ShipmentStoreActions.updateShipmentRequest({
          shipment,
          attributeName: 'courierName',
          value: newName
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(ShipmentStoreActions.updateShipmentSuccess({ shipment }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating tracking number', () => {
      beforeEach(() => {
        const newTrackingNumber = factory.stringNext();
        context.modalReturnValue = { result: Promise.resolve(newTrackingNumber) };
        context.updateEntity = () => {
          component.updateTrackingNumber();
        };

        context.expectedSuccessAction = ShipmentStoreActions.updateShipmentRequest({
          shipment,
          attributeName: 'trackingNumber',
          value: newTrackingNumber
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(ShipmentStoreActions.updateShipmentSuccess({ shipment }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating FROM location', () => {
      beforeEach(() => {
        const centre = new Centre().deserialize(
          factory.centre({
            locations: [factory.location()]
          })
        );
        const newLocationInfo = new CentreLocationInfo().deserialize(factory.centreLocationInfo(centre));
        context.modalReturnValue = { result: Promise.resolve(newLocationInfo) };
        context.updateEntity = () => {
          component.updateFromLocation();
        };

        context.expectedSuccessAction = ShipmentStoreActions.updateShipmentRequest({
          shipment,
          attributeName: 'fromLocation',
          value: newLocationInfo
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(ShipmentStoreActions.updateShipmentSuccess({ shipment }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating TO location', () => {
      beforeEach(() => {
        const centre = new Centre().deserialize(
          factory.centre({
            locations: [factory.location()]
          })
        );
        const newLocationInfo = new CentreLocationInfo().deserialize(factory.centreLocationInfo(centre));
        context.modalReturnValue = { result: Promise.resolve(newLocationInfo) };
        context.updateEntity = () => {
          component.updateToLocation();
        };

        context.expectedSuccessAction = ShipmentStoreActions.updateShipmentRequest({
          shipment,
          attributeName: 'toLocation',
          value: newLocationInfo
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(ShipmentStoreActions.updateShipmentSuccess({ shipment }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });
  });

  it.each`
    label
    ${'Update Courier'}
    ${'Update Tracking Number'}
    ${'Update Source Location'}
    ${'Update Destination Location'}
    ${'Remove Shipment'}
  `('menu item with $label is defined', ({ label }) => {
    fixture.detectChanges();
    const menuItem = component.menuItems.find(item => item.kind === 'selectable' && item.label === label);
    const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
    expect(selectableMenuItem).toBeTruthy();
    expect(selectableMenuItem.onSelected).toBeFunction();
  });

  it('emits an event when the user wishes to remove the shipment', () => {
    fixture.detectChanges();

    let eventProduced = false;
    component.onRemove.subscribe(() => {
      eventProduced = true;
    });

    const menuItem = component.menuItems.find(item => item.label === 'Remove Shipment');
    expect(menuItem).toBeTruthy();
    menuItem.selected();

    fixture.detectChanges();
    expect(eventProduced).toBe(true);
  });
});
