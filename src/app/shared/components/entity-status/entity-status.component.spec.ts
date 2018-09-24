import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { EntityStatusComponent } from './entity-status.component';
import { TimeagoPipe } from '@app/shared/pipes';

describe('EntityStatusComponent', () => {
  let component: EntityStatusComponent;
  let fixture: ComponentFixture<EntityStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EntityStatusComponent,
        TimeagoPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
