import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionEvent, Participant, Specimen } from '@app/domain/participants';
import { ModalComponent } from '@app/modules/modals/components/modal/modal.component';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Factory } from '@test/factory';
import { SpecimenViewModalComponent } from './specimen-view-modal.component';

describe('SpecimenViewModalComponent', () => {
  let component: SpecimenViewModalComponent;
  let fixture: ComponentFixture<SpecimenViewModalComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [SpecimenViewModalComponent, ModalComponent, YesNoPipe],
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
