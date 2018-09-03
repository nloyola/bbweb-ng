import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed, inject } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthGuard } from './auth.guard';
import { AUTH_TOKEN_LOCAL_STORAGE_KEY } from '@app/core/services/auth.service';
import { User } from '@app/domain/users';
import { Factory } from '@app/test/factory';

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

    location = TestBed.get(Location);
    router = TestBed.get(Router);
    factory = new Factory();
  });

  it('can navigate to router when user is logged in', () => {
    fakeLogin();
    router.navigate(['/admin'])
      .then(value => {
        expect(location.path()).toBe('/admin');
      })
      .catch(err => {
        fail('should not be invoked');
      });
  });

  it('can NOT navigate to router when user is NOT logged in', () => {
    router.navigate(['/admin'])
      .then(value => {
        expect(location.path()).toBe('/');
      })
      .catch(err => {
        fail('should not be invoked');
      });
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
