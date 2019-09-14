import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalInputComponent } from '@app/modules/modals/components/modal-input/modal-input.component';
import { CentreStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { NgbModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { ModalInputCentreLocationComponent } from './modal-input-centre-location.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ModalInputCentreLocationComponent', () => {
  let component: ModalInputCentreLocationComponent;
  let fixture: ComponentFixture<ModalInputCentreLocationComponent>;

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
    fixture = TestBed.createComponent(ModalInputCentreLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
