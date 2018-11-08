import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AUTH_TOKEN_LOCAL_STORAGE_KEY } from '@app/core/services/auth.service';
import { User } from '@app/domain/users';
import { Factory } from '@app/test/factory';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {

  @Component({ template: '<router-outlet></router-outlet>' })
  class TestRootComponent { }

  @Component({ template: 'Test component' })
  class TestComponent { }

  const routes: Routes = [
    {
      path: 'admin',
      component: TestRootComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'login',
      component: TestComponent
    }
  ];

  let ngZone: NgZone;
  let location: Location;
  let router: Router;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes)
      ],
      declarations: [TestRootComponent, TestComponent],
      providers: [AuthGuard]
    });

    localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE_KEY);

    ngZone = TestBed.get(NgZone);
    location = TestBed.get(Location);
    router = TestBed.get(Router);
    factory = new Factory();

    ngZone.run(() => router.initialNavigation());
  });

  it('can navigate to router when user is logged in', () => {
    fakeLogin();

    ngZone.run(() => router.navigate(['/admin'])
               .then(value => {
                 expect(location.path()).toBe('/admin');
               })
               .catch(() => {
                 fail('should not be invoked');
               }));
  });

  it('can NOT navigate to admin page when user is NOT logged in', () => {
    ngZone.run(() =>
               router.navigate(['/admin'])
               .then(() => {
                 expect(location.path()).toContain('returnUrl');
               })
               .catch(err => {
                 fail('should not be invoked');
               }));
  });

  function fakeLogin() {
    const tokenData = {
      token: 'fake token',
      user: factory.user()
    };

    localStorage.setItem('authToken', JSON.stringify(tokenData));
    return new User().deserialize(tokenData.user);
  }

});
