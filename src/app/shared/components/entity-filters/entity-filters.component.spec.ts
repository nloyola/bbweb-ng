import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityFiltersComponent } from './entity-filters.component';

describe('EntityFiltersComponent', () => {
  let component: EntityFiltersComponent;
  let fixture: ComponentFixture<EntityFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
