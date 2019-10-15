import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CentreStoreActions, CentreStoreReducer, NgrxRuntimeChecks, RootStoreState } from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ShippingCentresSelectComponent } from './shipping-centres-select.component';
import { ToastrModule } from 'ngx-toastr';
import { Centre } from '@app/domain/centres';
import { TestUtils } from '@test/utils';

describe('ShippingCentresSelectComponent', () => {
  let component: ShippingCentresSelectComponent;
  let fixture: ComponentFixture<ShippingCentresSelectComponent>;
  const factory = new Factory();
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({ centre: CentreStoreReducer.reducer }, NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      declarations: [ShippingCentresSelectComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(ShippingCentresSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each`
    centreNameFilter | searchParamFilter
    ${'test-centre'} | ${'name:like:test-centre;state::enabled'}
    ${''}            | ${'state::enabled'}
  `(
    'action is dispatched when filtering by name "$centreNameFilter"',
    ({ centreNameFilter, searchParamFilter }) => {
      const dispatchListener = jest.spyOn(store, 'dispatch');
      component.nameFilterChanged(centreNameFilter);
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      const expectedAction = CentreStoreActions.searchCentresRequest({
        searchParams: {
          filter: searchParamFilter,
          sort: 'name',
          page: 1,
          limit: 5
        }
      });
      expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
    }
  );

  it('action is dispatched when a page is selected', () => {
    const dispatchListener = jest.spyOn(store, 'dispatch');
    component.paginationPageChange();
    fixture.detectChanges();

    expect(dispatchListener.mock.calls.length).toBe(1);
    const expectedAction = CentreStoreActions.searchCentresRequest({
      searchParams: {
        filter: `state::enabled`,
        sort: 'name',
        page: 1,
        limit: 5
      }
    });
    expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
  });

  it('emits an event when a centre is selected', () => {
    const centre = new Centre().deserialize(factory.centre());
    fixture.detectChanges();
    let eventProduced = false;
    component.onSelected.subscribe(() => {
      eventProduced = true;
    });

    component.centreSelected(centre);
    fixture.detectChanges();
    expect(eventProduced).toBe(true);
  });

  it('displays a toastr error when an error is reported', fakeAsync(() => {
    const toastrListener = TestUtils.toastrErrorListener();
    const message = 'simulated error';
    fixture.detectChanges();

    store.dispatch(
      CentreStoreActions.searchCentresFailure({
        error: {
          error: {
            message
          }
        }
      })
    );
    flush();
    fixture.detectChanges();
    expect(toastrListener.mock.calls.length).toBe(1);
    expect(toastrListener.mock.calls[0][0]).toEqual(message);
  }));
});
