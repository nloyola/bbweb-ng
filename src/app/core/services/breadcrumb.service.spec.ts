import { Location } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {

  @Component({ template: '<router-outlet></router-outlet>' })
  class TestRootComponent { }

  /* tslint:disable-next-line:max-classes-per-file */
  @Component({ template: 'Test component' })
  class TestComponent { }

  const routes: Routes = [
    {
      path: 'admin',
      data: {
        breadcrumbs: 'Admin'
      },
      children: [
        {
          path: '',
          component: TestRootComponent
        },
        {
          path: 'studies',
          data: {
            breadcrumbs: 'Studies'
          },
          children: [
            {
              path: '',
              component: TestComponent
            },
            {
              path: 'add',
              component: TestComponent,
              data: {
                breadcrumbs: 'Add'
              }
            }
          ]
        }
      ]
    }
  ];

  let ngZone: NgZone;
  let router: Router;
  let service: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes)
      ],
      declarations: [TestRootComponent, TestComponent],
      providers: [BreadcrumbService]
    });

    ngZone = TestBed.get(NgZone);
    router = TestBed.get(Router);
    service = TestBed.get(BreadcrumbService);

    ngZone.run(() => router.initialNavigation());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('navigating to /admin/studies/add has the correct breadcrumbs', () => {
    ngZone.run(() => {
      router.navigate(['/admin/studies/add'])
        .then(() => {
          service.crumbs$.subscribe(result => {
            expect(result.length).toBe(4); // need to add link for Home page
            expect(result).toContain({ label: 'Admin', path: '/admin' });
            expect(result).toContain({ label: 'Studies', path: '/admin/studies' });
            expect(result).toContain({ label: 'Add', path: '/admin/studies/add' });
          });
      });
    });
  });

});
