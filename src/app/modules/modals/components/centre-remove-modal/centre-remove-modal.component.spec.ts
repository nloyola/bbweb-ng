import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CentreRemoveModalComponent } from './centre-remove-modal.component';
import { Centre } from '@app/domain/centres';
import { Factory } from '@test/factory';

describe('CentreRemoveComponent', () => {
  let component: CentreRemoveModalComponent;
  let fixture: ComponentFixture<CentreRemoveModalComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [CentreRemoveModalComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreRemoveModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.centre = new Centre().deserialize(factory.centre());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
