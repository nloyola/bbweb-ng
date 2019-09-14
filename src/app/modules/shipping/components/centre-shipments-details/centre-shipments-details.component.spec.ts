import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgrxRuntimeChecks, ShipmentSpecimenStoreReducer, ShipmentStoreReducer } from '@app/root-store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule } from 'ngx-toastr';
import { CentreShipmentsDetailsComponent } from './centre-shipments-details.component';
import { Centre } from '@app/domain/centres';

describe('CentreShipmentsDetailsComponent', () => {
  let component: CentreShipmentsDetailsComponent;
  let fixture: ComponentFixture<CentreShipmentsDetailsComponent>;
  const factory = new Factory();
  let centre: Centre;

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre());
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            shipment: ShipmentStoreReducer.reducer,
            'shipment-specimen': ShipmentSpecimenStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              parent: {
                snapshot: {
                  data: {
                    centre
                  }
                }
              }
            }
          }
        }
      ],
      declarations: [CentreShipmentsDetailsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreShipmentsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
