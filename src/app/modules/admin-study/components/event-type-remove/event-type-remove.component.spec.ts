import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventTypeRemoveComponent } from './event-type-remove.component';
import { CollectionEventType } from '@app/domain/studies';
import { ModalInputComponent } from '@app/modules/modals/components/modal-input/modal-input.component';

describe('EventTypeRemoveComponent', () => {
  let component: EventTypeRemoveComponent;
  let fixture: ComponentFixture<EventTypeRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [ModalInputComponent, EventTypeRemoveComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTypeRemoveComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.eventType = new CollectionEventType();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
