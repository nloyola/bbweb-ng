import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { StudySummaryComponent } from './study-summary.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('StudySummaryComponent', () => {

  let component: StudySummaryComponent;
  let fixture: ComponentFixture<StudySummaryComponent>;
  let ngZone: NgZone;
  let store: Store<StudyStoreReducer.State>;
  let router: Router;
  let modalService: NgbModal;
  let factory: Factory;
  let study: Study;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize(factory.study());

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                params: {
                  slug: study.slug
                }
              }
            },
            snapshot: {}
          }
        }
      ],
      declarations: [ StudySummaryComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    modalService = TestBed.get(NgbModal);
    fixture = TestBed.createComponent(StudySummaryComponent);
    component = fixture.componentInstance;

    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('isEnableAllowed resolved correctly', fakeAsync(() => {
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    fixture.detectChanges();

    [ false, true ].forEach(allowed => {
      store.dispatch(new StudyStoreActions.GetEnableAllowedSuccess({ studyId: study.id, allowed }));
      flush();
      fixture.detectChanges();
      expect(component.isEnableAllowed).toBe(allowed);
    });
  }));

  it('navigates to new path when study name is changed', fakeAsync(() => {
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    flush();
    fixture.detectChanges();

    const newName = factory.stringNext();
    const studyWithNewName = new Study().deserialize({
      ...study as any,
      ...factory.nameAndSlug()
    });

    const routerListener = jest.spyOn(router, 'navigate');
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newName) });
    component.updateName();
    flush();
    fixture.detectChanges();

    ngZone.run(() => store.dispatch(new StudyStoreActions.UpdateStudySuccess({ study: studyWithNewName })));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ '../..', studyWithNewName.slug, 'summary' ]);
  }));

  describe('common behaviour', () => {

    it('functions should open a modal', fakeAsync(() => {
      const testData = [
        {
          componentFunc: (c) => c.updateName(),
          attribute: 'name',
          value: 'test'
        },
        {
          componentFunc: (c) => c.updateDescription(),
          attribute: 'description',
          value: 'test'
        }
      ];

      const storeListener = jest.spyOn(store, 'dispatch');
      const modalListener = jest.spyOn(modalService, 'open');

      ngZone.run(() => store.dispatch(new StudyStoreActions.GetStudySuccess({ study })));
      fixture.detectChanges();

      storeListener.mockClear();
      testData.forEach((testInfo, index) => {
        modalListener.mockReturnValue({
          componentInstance: {},
          result: Promise.resolve(testInfo.value)
        });

        testInfo.componentFunc(component);
        fixture.detectChanges();
        tick(1000);

        expect(storeListener.mock.calls.length).toBe(index + 1);
        expect(storeListener.mock.calls[index][0]).toEqual(new StudyStoreActions.UpdateStudyRequest({
          study,
          attributeName: testInfo.attribute,
          value: testInfo.value
        }));
      });
      expect(modalListener.mock.calls.length).toBe(testData.length);
    }));

    it('functions that should notify the user', fakeAsync(() => {
      const toastr = TestBed.get(ToastrService);

      jest.spyOn(toastr, 'success').mockReturnValue(null);
      jest.spyOn(store, 'dispatch');
      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('test')
      });

      ngZone.run(() => store.dispatch(new StudyStoreActions.GetStudySuccess({ study })));
      fixture.detectChanges();

      const componentUpdateFuncs = [
        (c) => c.updateName(),
        (c) => c.updateDescription(),
        (c) => c.disable(),
        (c) => c.enable(),
        (c) => c.retire(),
        (c) => c.unretire()
      ];

      componentUpdateFuncs.forEach(updateFunc => {
        updateFunc(component);
        fixture.detectChanges();
        tick(1000);
        expect(store.dispatch).toHaveBeenCalled();
        ngZone.run(() => store.dispatch(new StudyStoreActions.UpdateStudySuccess({ study })));
        tick(1000);
      });

      tick(1000);
      expect(toastr.success.mock.calls.length).toBe(componentUpdateFuncs.length);
    }));

    it('functions that change the study state', fakeAsync(() => {
      ngZone.run(() => store.dispatch(new StudyStoreActions.GetStudySuccess({ study })));
      fixture.detectChanges();

      const testData = [
        { componentFunc: (c) => c.disable(),  value: 'disable' },
        { componentFunc: (c) => c.enable(),   value: 'enable' },
        { componentFunc: (c) => c.retire(),   value: 'retire' },
        { componentFunc: (c) => c.unretire(), value: 'unretire' }
      ];

      const storeListener = jest.spyOn(store, 'dispatch');
      testData.forEach((testInfo, index) => {
        testInfo.componentFunc(component);
        fixture.detectChanges();
        tick(1000);

        expect(storeListener.mock.calls.length).toBe(index + 1);
        expect(storeListener.mock.calls[index][0]).toEqual(new StudyStoreActions.UpdateStudyRequest({
          study,
          attributeName: 'state',
          value: testInfo.value
        }));
      });
    }));
  });

});
