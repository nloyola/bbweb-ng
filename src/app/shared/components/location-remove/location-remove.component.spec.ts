import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationRemoveComponent } from './location-remove.component';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@app/domain';

describe('LocationRemoveComponent', () => {
  let component: LocationRemoveComponent;
  let fixture: ComponentFixture<LocationRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [LocationRemoveComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationRemoveComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.location = new Location();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
