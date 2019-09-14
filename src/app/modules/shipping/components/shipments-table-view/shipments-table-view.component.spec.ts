import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalTimePipe } from '@app/shared/pipes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ShipmentsTableViewComponent } from './shipments-table-view.component';

describe('ShipmentsTableViewComponent', () => {
  let component: ShipmentsTableViewComponent;
  let fixture: ComponentFixture<ShipmentsTableViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NgbModule],
      declarations: [ShipmentsTableViewComponent, LocalTimePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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
