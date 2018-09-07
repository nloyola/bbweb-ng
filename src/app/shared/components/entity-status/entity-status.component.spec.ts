import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityStatusComponent } from './entity-status.component';

describe('EntityStatusComponent', () => {
  let component: EntityStatusComponent;
  let fixture: ComponentFixture<EntityStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityStatusComponent ]
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
