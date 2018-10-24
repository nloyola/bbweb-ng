import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectedSpecimenDefinitionAddComponent } from './collected-specimen-definition-add.component';

describe('CollectedSpecimenDefinitionAddComponent', () => {
  let component: CollectedSpecimenDefinitionAddComponent;
  let fixture: ComponentFixture<CollectedSpecimenDefinitionAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectedSpecimenDefinitionAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectedSpecimenDefinitionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
