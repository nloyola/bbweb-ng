import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySummaryComponent } from './entity-summary.component';

describe('EntitySummaryComponent', () => {
  let component: EntitySummaryComponent;
  let fixture: ComponentFixture<EntitySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
