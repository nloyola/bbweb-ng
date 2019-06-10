import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EventSpecimensViewComponent } from './event-specimens-view.component';
import { ModalInputComponent } from '@app/modules/modals/components/modal-input/modal-input.component';
import { StoreModule } from '@ngrx/store';
import { SpecimenStoreReducer } from '@app/root-store';

describe('EventSpecimensViewComponent', () => {
  let component: EventSpecimensViewComponent;
  let fixture: ComponentFixture<EventSpecimensViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        StoreModule.forRoot({
          'specimen': SpecimenStoreReducer.reducer
        })
      ],
      providers: [
        NgbActiveModal
      ],
      declarations: [
        EventSpecimensViewComponent,
        ModalInputComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSpecimensViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
