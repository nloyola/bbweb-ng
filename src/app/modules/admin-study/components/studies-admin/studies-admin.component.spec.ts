import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudiesAdminComponent } from './studies-admin.component';
import { StudyStoreReducer } from '@app/root-store';
import { StoreModule } from '@ngrx/store';

describe('StudiesAdminComponent', () => {

  let component: StudiesAdminComponent;
  let fixture: ComponentFixture<StudiesAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer
        })
      ],
      declarations: [StudiesAdminComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    fixture = TestBed.createComponent(StudiesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
