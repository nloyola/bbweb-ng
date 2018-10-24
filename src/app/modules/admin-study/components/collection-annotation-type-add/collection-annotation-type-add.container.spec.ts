import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionAnnotationTypeAddContainer } from './collection-annotation-type-add.component';

describe('CollectionAnnotationTypeAddContainer', () => {
  let component: CollectionAnnotationTypeAddContainer;
  let fixture: ComponentFixture<CollectionAnnotationTypeAddContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionAnnotationTypeAddContainer ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionAnnotationTypeAddContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
