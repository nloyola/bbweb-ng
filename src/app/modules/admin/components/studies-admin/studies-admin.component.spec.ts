import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudiesAdminComponent } from './studies-admin.component';

describe('StudiesAdminComponent', () => {
  let component: StudiesAdminComponent;
  let fixture: ComponentFixture<StudiesAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudiesAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudiesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
