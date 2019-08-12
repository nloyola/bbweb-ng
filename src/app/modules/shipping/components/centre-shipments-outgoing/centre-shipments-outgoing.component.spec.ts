import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Centre } from '@app/domain/centres';
import { NgrxRuntimeChecks, ShipmentStoreReducer } from '@app/root-store';
import { StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { CentreShipmentsOutgoingComponent } from './centre-shipments-outgoing.component';

describe('CentreShipmentsOutgoingComponent', () => {
  let component: CentreShipmentsOutgoingComponent;
  let fixture: ComponentFixture<CentreShipmentsOutgoingComponent>;
  let centre: Centre;
  const factory = new Factory();

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre());
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  centre
                }
              }
            }
          }
        }
      ],
      declarations: [CentreShipmentsOutgoingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreShipmentsOutgoingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
