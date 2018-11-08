import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StudyViewComponent } from './study-view.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { StudyStoreReducer } from '@app/root-store';
import { ActivatedRoute, Data } from '@angular/router';
import { Factory } from '@app/test/factory';
import { Study } from '@app/domain/studies';
import { SpinnerStoreReducer } from '@app/root-store/spinner';

describe('StudyViewComponent', () => {

  let component: StudyViewComponent;
  let fixture: ComponentFixture<StudyViewComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot(),
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        })
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                study: new Study().deserialize(factory.study())
              }
            }
          }
        }
      ],
      declarations: [ StudyViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
