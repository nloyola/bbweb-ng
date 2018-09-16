import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecimenViewComponent } from './specimen-view.component';

describe('SpecimenViewComponent', () => {
  let component: SpecimenViewComponent;
  let fixture: ComponentFixture<SpecimenViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecimenViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
