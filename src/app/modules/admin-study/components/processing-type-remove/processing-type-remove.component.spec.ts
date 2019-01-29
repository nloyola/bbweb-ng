import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProcessingTypeRemoveComponent } from './processing-type-remove.component';
import { Factory } from '@app/test/factory';
import { ProcessingType } from '@app/domain/studies';

describe('ProcessingTypeRemoveComponent', () => {
  let component: ProcessingTypeRemoveComponent;
  let fixture: ComponentFixture<ProcessingTypeRemoveComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        NgbActiveModal
      ],
      declarations: [ ProcessingTypeRemoveComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeRemoveComponent);
    component = fixture.componentInstance;
    factory = new Factory();
  });

  it('should create', () => {
    component.processingType = new ProcessingType().deserialize(factory.processingType());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
