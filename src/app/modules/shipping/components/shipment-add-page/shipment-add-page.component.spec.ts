import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgrxRuntimeChecks, ShipmentStoreReducer } from '@app/root-store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';
import { ShipmentAddPageComponent } from './shipment-add-page.component';

describe('ShipmentAddPageComponent', () => {
  let component: ShipmentAddPageComponent;
  let fixture: ComponentFixture<ShipmentAddPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      declarations: [ShipmentAddPageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentAddPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
