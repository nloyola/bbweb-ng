import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CentreLocationsSearchReply } from '@app/core/services';
import { Centre } from '@app/domain/centres';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import {
  CentreStoreActions,
  CentreStoreReducer,
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentStoreActions,
  ShipmentStoreReducer
} from '@app/root-store';
import { NgbModule, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { LocationFixture } from '@test/fixtures';
import { TestUtils } from '@test/utils';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentAddPageComponent } from './shipment-add-page.component';

describe('ShipmentAddPageComponent', () => {
  let component: ShipmentAddPageComponent;
  let fixture: ComponentFixture<ShipmentAddPageComponent>;
  let store: Store<RootStoreState.State>;
  let router: Router;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            centre: CentreStoreReducer.reducer,
            shipment: ShipmentStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      declarations: [ShipmentAddPageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(ShipmentAddPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  describe('courier name input validity', () => {
    it('is required', () => {
      const errors = component.courierName.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      component.courierName.setValue('aname');
      const errors = component.courierName.errors || {};
      expect(errors).toEqual({});
    });
  });

  describe('when submitting', () => {
    it('on valid submission', fakeAsync(() => {
      const shipment = new Shipment().deserialize(factory.shipment());
      const toastrListener = TestUtils.toastrSuccessListener();
      const storeListener = jest.spyOn(store, 'dispatch');
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.courierName.setValue(shipment.courierName);
      component.trackingNumber.setValue(shipment.trackingNumber);
      component.origin.setValue(shipment.origin);
      component.destination.setValue(shipment.destination);
      component.onSubmit();

      const expectedAction = ShipmentStoreActions.addShipmentRequest({
        shipment: new Shipment().deserialize({
          courierName: shipment.courierName,
          trackingNumber: shipment.trackingNumber,
          origin: shipment.origin,
          destination: shipment.destination,
          state: ShipmentState.Created
        } as any)
      });

      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(expectedAction);

      store.dispatch(ShipmentStoreActions.addShipmentSuccess({ shipment }));
      fixture.detectChanges();
      flush();

      expect(toastrListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual([
        '/shipping',
        shipment.origin.slug,
        'outgoing',
        'view',
        shipment.id
      ]);
    }));

    const errorTable = [
      {
        status: 401,
        statusText: 'Unauthorized'
      },
      {
        status: 404,
        error: {
          message: 'simulated error'
        }
      },
      {
        status: 404,
        error: {
          message: 'EntityCriteriaError: shipment with tracking number already exists'
        }
      }
    ];

    describe.each(errorTable)('on submission failure', error => {
      it('displays error', fakeAsync(() => {
        const shipment = new Shipment().deserialize(factory.shipment());
        const toastrListener = TestUtils.toastrErrorListener();

        component.courierName.setValue(shipment.courierName);
        component.trackingNumber.setValue(shipment.trackingNumber);
        component.origin.setValue(shipment.origin);
        component.destination.setValue(shipment.destination);
        component.onSubmit();
        flush();
        fixture.detectChanges();

        const action = ShipmentStoreActions.addShipmentFailure({ error });
        store.dispatch(action);
        flush();
        fixture.detectChanges();
        expect(toastrListener.mock.calls.length).toBe(1);
      }));
    });
  });

  it('on cancel', () => {
    const navigateListener = TestUtils.routerNavigateListener();
    component.onCancel();
    expect(navigateListener.mock.calls.length).toBe(1);
    expect(navigateListener.mock.calls[0][0]).toEqual(['..']);
  });

  describe.each`
    inputType        | typeAhead                 | otherTypeahead            | formControlName
    ${'origin'}      | ${'originTypeahead'}      | ${'destinationTypeahead'} | ${'origin'}
    ${'destination'} | ${'destinationTypeahead'} | ${'originTypeahead'}      | ${'destination'}
  `(
    'when selecting from the "$inputType" type ahead',
    ({ inputType, typeAhead, otherTypeahead, formControlName }) => {
      it('selected centre is assigned to the form value', () => {
        const centre = new Centre().deserialize(factory.centre());

        expect(component[typeAhead]).toBeDefined();
        component[typeAhead].onEntitySelected({
          item: { id: centre.id }
        } as NgbTypeaheadSelectItemEvent);

        expect(component[formControlName]).toBeDefined();
        expect(component[formControlName].value.id).toBe(centre.id);
      });

      it('location from the search results are displayed to the user', fakeAsync(() => {
        const { centreLocations } = LocationFixture.locationsFixture(factory);
        const filter = centreLocations[0].combinedName.charAt(0);
        const searchReply: CentreLocationsSearchReply = { filter, centreLocations };

        const inputElement = getInputByFormControlName(formControlName);
        inputElement.nativeElement.value = filter;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        tick(500);
        fixture.detectChanges();

        store.dispatch(CentreStoreActions.searchLocationsSuccess({ searchReply }));
        fixture.detectChanges();

        tick(500);
        fixture.detectChanges();

        const dropdownItems = fixture.debugElement.queryAll(By.css('.dropdown-item'));
        expect(dropdownItems.length).toBeGreaterThan(0);
        dropdownItems.forEach((item, index) => {
          expect(item.nativeElement.textContent).toBe(centreLocations[index].combinedName);
        });
      }));

      it('location is filtered if already selected as from / to', fakeAsync(() => {
        const { centreLocations } = LocationFixture.locationsFixture(factory);
        const filter = centreLocations[0].combinedName.charAt(0);
        const searchReply: CentreLocationsSearchReply = { filter, centreLocations };

        const inputElement = getInputByFormControlName(formControlName);
        inputElement.nativeElement.value = filter;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        expect(component[otherTypeahead]).toBeDefined();
        component[otherTypeahead].selectedEntity = centreLocations[1];

        tick(500);
        fixture.detectChanges();

        store.dispatch(CentreStoreActions.searchLocationsSuccess({ searchReply }));
        fixture.detectChanges();

        tick(500);
        fixture.detectChanges();

        const dropdownItems = fixture.debugElement.queryAll(By.css('.dropdown-item'));
        expect(dropdownItems.length).toBeGreaterThan(0);
        expect(dropdownItems[0].nativeElement.textContent).toBe(centreLocations[0].combinedName);
      }));

      it('nothing displayed to the user if the search results are empty', fakeAsync(() => {
        const centreLocations = [];
        const filter = factory.stringNext().charAt(0);
        const searchReply: CentreLocationsSearchReply = { filter, centreLocations };

        const inputElement = getInputByFormControlName(formControlName);
        inputElement.nativeElement.value = filter;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        tick(500);
        fixture.detectChanges();

        store.dispatch(CentreStoreActions.searchLocationsSuccess({ searchReply }));
        fixture.detectChanges();

        tick(500);
        fixture.detectChanges();

        const dropdownItems = fixture.debugElement.queryAll(By.css('.dropdown-item'));
        expect(dropdownItems.length).toBe(0);
      }));
    }
  );

  function getInputByFormControlName(name: string): DebugElement {
    const inputElement = fixture.debugElement.query(By.css(`input[formControlName="${name}"]`));
    expect(inputElement).toBeDefined();
    return inputElement;
  }
});
