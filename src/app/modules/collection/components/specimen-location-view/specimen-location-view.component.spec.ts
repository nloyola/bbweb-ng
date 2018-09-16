import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecimenLocationViewComponent } from './specimen-location-view.component';

describe('SpecimenLocationViewComponent', () => {
  let component: SpecimenLocationViewComponent;
  let fixture: ComponentFixture<SpecimenLocationViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecimenLocationViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenLocationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
