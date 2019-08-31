import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CentreCountsComponent } from './centre-counts.component';
import { CentreState, CentreCountInfo } from '@app/domain/centres';

describe('CentreCountsComponent', () => {
  let component: CentreCountsComponent;
  let fixture: ComponentFixture<CentreCountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CentreCountsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentreCountsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.countData = new Map<CentreState, CentreCountInfo>([]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
