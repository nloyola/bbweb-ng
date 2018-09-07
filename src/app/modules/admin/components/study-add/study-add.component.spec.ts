import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';

import { StudyAddComponent } from './study-add.component';
import { StudyStoreActions, StudyStoreReducer } from '@app/root-store/study';

describe('StudyAddComponent', () => {

  let store: Store<StudyStoreReducer.State>;
  const actions: Observable<any>;
  let component: StudyAddComponent;
  let fixture: ComponentFixture<StudyAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [StudyAddComponent],
      providers: [
        provideMockActions(() => actions)
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudyAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
