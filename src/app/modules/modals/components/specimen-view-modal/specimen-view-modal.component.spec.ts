import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalInputComponent } from '@app/modules/modals/components/modal-input/modal-input.component';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenViewModalComponent } from './specimen-view-modal.component';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@test/factory';
import { Specimen, CollectionEvent, Participant } from '@app/domain/participants';

describe('SpecimenViewModalComponent', () => {
  let component: SpecimenViewModalComponent;
  let fixture: ComponentFixture<SpecimenViewModalComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [SpecimenViewModalComponent, ModalInputComponent, YesNoPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenViewModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.specimen = new Specimen().deserialize(factory.specimen());
    component.event = new CollectionEvent().deserialize(factory.defaultCollectionEvent());
    component.participant = new Participant().deserialize(factory.defaultParticipant());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
