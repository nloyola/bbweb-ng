import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store, StoreModule, combineReducers } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';

import { StudyStoreActions, StudyStoreReducer } from '@app/root-store/study';
import { StudiesAdminComponent } from './studies-admin.component';

describe('StudiesAdminComponent', () => {
  let store: Store<StudyStoreReducer.State>;
  let component: StudiesAdminComponent;
  let fixture: ComponentFixture<StudiesAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer
        })
      ],
      declarations: [StudiesAdminComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudiesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
