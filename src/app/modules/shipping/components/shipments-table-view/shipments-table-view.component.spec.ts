import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentsTableViewComponent } from './shipments-table-view.component';

describe('ShipmentsTableViewComponent', () => {
  let component: ShipmentsTableViewComponent;
  let fixture: ComponentFixture<ShipmentsTableViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentsTableViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentsTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
