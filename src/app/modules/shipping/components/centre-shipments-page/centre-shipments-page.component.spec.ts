import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentreShipmentsPageComponent } from './centre-shipments-page.component';

describe('CentreShipmentsComponent', () => {
  let component: CentreShipmentsPageComponent;
  let fixture: ComponentFixture<CentreShipmentsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CentreShipmentsPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreShipmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
