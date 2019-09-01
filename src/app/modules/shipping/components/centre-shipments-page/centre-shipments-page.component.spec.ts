import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CentreStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { CentreShipmentsPageComponent } from './centre-shipments-page.component';

describe('CentreShipmentsComponent', () => {
  let component: CentreShipmentsPageComponent;
  let fixture: ComponentFixture<CentreShipmentsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({ centre: CentreStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      providers: [NgbActiveModal],
      declarations: [CentreShipmentsPageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreShipmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
