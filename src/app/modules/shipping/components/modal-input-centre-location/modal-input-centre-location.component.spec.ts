import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalInputComponent } from '@app/modules/modals/components/modal-input/modal-input.component';
import { CentreStoreReducer, NgrxRuntimeChecks, CentreStoreActions, RootStoreState } from '@app/root-store';
import { NgbModule, NgbTypeaheadModule, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { StoreModule, Store } from '@ngrx/store';
import { ModalInputCentreLocationComponent } from './modal-input-centre-location.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as faker from 'faker';
import { ModalInputComponentBehaviour } from '@test/behaviours/modal-input-component.behaviour';
import { Centre } from '@app/domain/centres';
import { Factory } from '@test/factory';
import { LocationFixture } from '@test/fixtures';
import { CentreLocationsSearchReply } from '@app/core/services';

describe('ModalInputCentreLocationComponent', () => {
  let component: ModalInputCentreLocationComponent;
  let fixture: ComponentFixture<ModalInputCentreLocationComponent>;
  const factory = new Factory();
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        BrowserDynamicTestingModule,
        NgbModule,
        NgbTypeaheadModule,
        ReactiveFormsModule,
        StoreModule.forRoot({ centre: CentreStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      declarations: [ModalInputCentreLocationComponent, ModalInputComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(ModalInputCentreLocationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('shared behaviour', () => {
    const context: ModalInputComponentBehaviour.Context<ModalInputCentreLocationComponent, Date> = {};

    beforeEach(() => {
      context.fixture = fixture;
      context.assignOptions = options => {
        component.options = options;
      };
      context.assignMockModal = mockModal => {
        component.modal = mockModal;
      };
      context.assignInputValue = value => {
        component.input.setValue(value);
      };
      context.getValidValue = () => faker.date.recent(10);
      context.inputElement = () => fixture.debugElement.query(By.css('input'));
      context.markInputAsTouched = () => {
        component.input.markAllAsTouched();
      };
      context.requiredText = 'A Centre Location is required';
      context.confirm = () => component.confirm();
      context.dismiss = () => component.dismiss();
      fixture.detectChanges();
    });

    ModalInputComponentBehaviour.sharedBehaviour(context);
  });

  describe('when selecting from the type ahead', () => {
    it('selected centre is assigned to the form value', () => {
      const centre = new Centre().deserialize(factory.centre());

      fixture.detectChanges();
      component.locationTypeahead.onEntitySelected({
        item: { id: centre.id }
      } as NgbTypeaheadSelectItemEvent);

      expect(component.input.value.id).toBe(centre.id);
    });

    it('location from the search results are displayed to the user', fakeAsync(() => {
      const { centreLocations } = LocationFixture.locationsFixture(factory);
      const filter = centreLocations[0].combinedName.charAt(0);
      const searchReply: CentreLocationsSearchReply = { filter, centreLocations };

      fixture.detectChanges();
      const inputElement = getInputByFormControlName();
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

    it('locationIdToFilterOut is filtered', fakeAsync(() => {
      const { centreLocations } = LocationFixture.locationsFixture(factory);
      const filter = centreLocations[0].combinedName.charAt(0);
      const searchReply: CentreLocationsSearchReply = { filter, centreLocations };

      component.locationIdToFilterOut = centreLocations[1].location.id;
      fixture.detectChanges();
      const inputElement = getInputByFormControlName();
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
      expect(dropdownItems[0].nativeElement.textContent).toBe(centreLocations[0].combinedName);
    }));

    it('nothing displayed to the user if the search results are empty', fakeAsync(() => {
      const centreLocations = [];
      const filter = factory.stringNext().charAt(0);
      const searchReply: CentreLocationsSearchReply = { filter, centreLocations };

      const inputElement = getInputByFormControlName();
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
  });

  function getInputByFormControlName(): DebugElement {
    const inputElement = fixture.debugElement.query(By.css(`input[formControlName="input"]`));
    expect(inputElement).toBeDefined();
    return inputElement;
  }
});
