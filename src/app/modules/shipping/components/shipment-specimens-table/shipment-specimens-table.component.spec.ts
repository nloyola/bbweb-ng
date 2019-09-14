import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgrxRuntimeChecks, ShipmentSpecimenStoreReducer } from '@app/root-store';
import { LocalTimePipe } from '@app/shared/pipes';
import { StoreModule } from '@ngrx/store';
import { ShipmentSpecimensTableComponent } from './shipment-specimens-table.component';

describe('ShipmentSpecimensTableComponent', () => {
  let component: ShipmentSpecimensTableComponent;
  let fixture: ComponentFixture<ShipmentSpecimensTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        StoreModule.forRoot({ 'shipment-specimen': ShipmentSpecimenStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      declarations: [ShipmentSpecimensTableComponent, LocalTimePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentSpecimensTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
