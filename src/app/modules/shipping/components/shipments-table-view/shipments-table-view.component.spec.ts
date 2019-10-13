import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalTimePipe } from '@app/shared/pipes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ShipmentsTableViewComponent } from './shipments-table-view.component';
import { TitleCasePipe, CommonModule } from '@angular/common';
import { CentreShipmentsViewMode } from '../centre-shipments-details/centre-shipments-details.component';
import { By } from '@angular/platform-browser';
import { SortDirection } from '@angular/material/sort';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import { DropdownMenuSelectableItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { Factory } from '@test/factory';
import { TestUtils } from '@test/utils';

describe('ShipmentsTableViewComponent', () => {
  let component: ShipmentsTableViewComponent;
  let fixture: ComponentFixture<ShipmentsTableViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NgbModule, CommonModule],
      providers: [
        {
          provide: TitleCasePipe,
          useClass: TitleCasePipe
        }
      ],
      declarations: [ShipmentsTableViewComponent, LocalTimePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentsTableViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize the shipments array if input is undefined', () => {
    component.shipments = [];
    fixture.detectChanges();
    expect(component.shipments).toBeArrayOfSize(0);
  });

  it.each`
    viewMode                             | columnLabel
    ${CentreShipmentsViewMode.Incoming}  | ${'From'}
    ${CentreShipmentsViewMode.Outgoing}  | ${'To'}
    ${CentreShipmentsViewMode.Completed} | ${'From'}
  `(
    `should initialize the centre column label correctly for mode "$viewMode"`,
    ({ viewMode, columnLabel }) => {
      component.mode = viewMode;
      fixture.detectChanges();
      expect(component.sourceLabel).toBe(columnLabel);
    }
  );

  describe.each`
    formControlName     | outputName
    ${'courierName'}    | ${'filterByCourierName'}
    ${'trackingNumber'} | ${'filterByTrackingNumber'}
  `(
    'table filter with input "$formControlName" emits event on output "$outputName"',
    ({ formControlName, outputName }) => {
      it('when user enters a value into the filter', fakeAsync(() => {
        fixture.detectChanges();

        let eventProduced = false;
        expect(component[outputName]).toBeDefined();
        component[outputName].subscribe(() => {
          eventProduced = true;
        });

        const inputElements = fixture.debugElement.queryAll(
          By.css(`input[formControlName="${formControlName}"]`)
        );
        expect(inputElements.length).toBe(1);
        inputElements[0].nativeElement.dispatchEvent(new Event('input'));
        tick(500);
        fixture.detectChanges();

        expect(eventProduced).toBe(true);
      }));
    }
  );

  const sortTermsTable = ['courierName', 'trackingNumber', 'location', 'state'];

  describe.each(sortTermsTable)('when sorting by %s', (term, searchSortParam) => {
    it.each(['asc', 'desc', ''])('requests sorting in "%s" order', direction => {
      fixture.detectChanges();

      let eventProduced = false;
      component.sortBy.subscribe(() => {
        eventProduced = true;
      });

      component.sortData({
        active: term,
        direction: direction as SortDirection
      });
      fixture.detectChanges();

      expect(eventProduced).toBe(true);
    });
  });

  it('when user select a page', () => {
    fixture.detectChanges();

    let eventProduced = false;
    component.pageChanged.subscribe(() => {
      eventProduced = true;
    });

    component.paginationPageChanged(2);
    fixture.detectChanges();

    expect(eventProduced).toBe(true);
  });

  it.each`
    menuItemLabel        | outputName
    ${'View Shipment'}   | ${'viewShipment'}
    ${'Remove Shipment'} | ${'removeShipment'}
  `('menu item "$menuItemLabel" emits event on output "$outputName"', ({ menuItemLabel, outputName }) => {
    fixture.detectChanges();

    expect(component[outputName]).toBeDefined();
    let eventProduced = false;
    component[outputName].subscribe(() => {
      eventProduced = true;
    });

    const factory = new Factory();
    const shipment = new Shipment().deserialize(factory.shipment({ state: ShipmentState.Created }));

    const menuItem = component
      .menuItemsForShipment(shipment)
      .find(mi => mi.kind === 'selectable' && mi.label == menuItemLabel);

    const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
    expect(selectableMenuItem).toBeDefined();
    expect(selectableMenuItem.onSelected).toBeFunction();
    selectableMenuItem.onSelected();

    expect(eventProduced).toBe(true);
  });

  const filterLabelTable = Object.values(ShipmentState)
    .map(state => [state, 'By ' + TestUtils.capitalizeFirstLetter(state)])
    .concat([[undefined, 'Filter by state']]);

  describe.each(filterLabelTable)(
    'when state %s is selected as the state filter',
    (shipmentState, filterLabel) => {
      it('emits the correct event', () => {
        fixture.detectChanges();

        let eventProduced = false;
        component.filterByState.subscribe(() => {
          eventProduced = true;
        });

        component.filterUpdated(shipmentState);
        expect(eventProduced).toBe(true);
      });

      it('state filter label is updated corrrectly ', () => {
        fixture.detectChanges();
        component.filterUpdated(shipmentState);
        expect(component.filterByLabel).toBe(filterLabel);
      });
    }
  );

  it.each`
    shipmentState              | menuItemSize
    ${ShipmentState.Created}   | ${2}
    ${ShipmentState.Packed}    | ${1}
    ${ShipmentState.Sent}      | ${1}
    ${ShipmentState.Received}  | ${1}
    ${ShipmentState.Unpacked}  | ${1}
    ${ShipmentState.Lost}      | ${1}
    ${ShipmentState.Completed} | ${1}
  `(
    'shipment in state $shipmentState has $menuItemSize dropdown menu items',
    ({ shipmentState, menuItemSize }) => {
      fixture.detectChanges();

      const factory = new Factory();
      const shipment = new Shipment().deserialize(factory.shipment({ state: shipmentState }));
      const menuItems = component.menuItemsForShipment(shipment);

      expect(menuItems).toBeArrayOfSize(menuItemSize);
    }
  );
});
