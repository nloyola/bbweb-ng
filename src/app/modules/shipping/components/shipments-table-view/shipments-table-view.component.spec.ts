import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ShipmentsTableViewComponent } from './shipments-table-view.component';

describe('ShipmentsTableViewComponent', () => {
  let component: ShipmentsTableViewComponent;
  let fixture: ComponentFixture<ShipmentsTableViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NgbModule],
      declarations: [ShipmentsTableViewComponent]
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
