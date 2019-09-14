import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CentreStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { StoreModule } from '@ngrx/store';
import { ShippingCentresSelectComponent } from './shipping-centres-select.component';

describe('ShippingCentresSelectComponent', () => {
  let component: ShippingCentresSelectComponent;
  let fixture: ComponentFixture<ShippingCentresSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({ centre: CentreStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      declarations: [ShippingCentresSelectComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingCentresSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
