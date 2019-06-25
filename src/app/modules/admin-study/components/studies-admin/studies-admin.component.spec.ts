import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudiesAdminComponent } from './studies-admin.component';
import { StudyStoreReducer } from '@app/root-store';
import { StoreModule } from '@ngrx/store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';

describe('StudiesAdminComponent', () => {

  let component: StudiesAdminComponent;
  let fixture: ComponentFixture<StudiesAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(
          {
            'study': StudyStoreReducer.reducer
          },
          NgrxRuntimeChecks)
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
