import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User, UserCounts } from '@app/domain/users';
import { Factory } from '@test/factory';
import { UserService } from './user.service';
import * as faker from 'faker';
import { SearchParams, PagedReply } from '@app/domain';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';

describe('UserService', () => {
  const BASE_URL = '/api/users';

  let httpMock: HttpTestingController;
  let service: UserService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(UserService);
    factory = new Factory();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('makes a password reset request', () => {
    const user = new User().deserialize(factory.user());

    service.passwordReset(user.email).subscribe(u => {
      expect(u.email).toBe(user.email);
    });

    const req = httpMock.expectOne(`${BASE_URL}/passreset`);
    expect(req.request.method).toBe('POST');
    req.flush(user);
  });

  describe('for user counts', () => {
    it('reply is handled correctly', () => {
      const counts = factory.userCounts();
      service.counts().subscribe((s: UserCounts) => {
        expect(s.total).toBe(counts.total);
        expect(s.registeredCount).toBe(counts.registeredCount);
        expect(s.activeCount).toBe(counts.activeCount);
        expect(s.lockedCount).toBe(counts.lockedCount);
      });

      const req = httpMock.expectOne(`${BASE_URL}/counts`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: counts });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.counts().subscribe(
        () => {
          fail('should have been an error response');
        },
        err => {
          expect(err.message).toContain('expected a user object');
        }
      );

      const req = httpMock.expectOne(`${BASE_URL}/counts`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });
  });
  describe('when requesting a user', () => {
    let rawUser: any;
    let user: User;

    beforeEach(() => {
      rawUser = factory.user();
      user = new User().deserialize(rawUser);
    });

    it('reply is handled correctly', () => {
      service.get(user.slug).subscribe(s => {
        expect(s).toEqual(jasmine.any(User));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${user.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawUser });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.get(user.slug).subscribe(
        () => {
          fail('should have been an error response');
        },
        err => {
          expect(err.message).toContain('expected a user object');
        }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${user.slug}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });
  });

  describe('when searching users', () => {
    const context: PagedQueryBehaviour.Context<User> = {};

    beforeEach(() => {
      context.search = (searchParams: SearchParams) => service.search(searchParams);
      context.url = `${BASE_URL}/search`;
      context.replyItems = [factory.user()];
      context.subscription = (pr: PagedReply<User>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(User));
      };
    });

    PagedQueryBehaviour.sharedBehaviour(context);
  });

  describe('for updating a user', () => {
    let rawUser: any;
    let user: User;
    let testData: any;

    beforeEach(() => {
      rawUser = factory.user();
      user = new User().deserialize(rawUser);
      testData = [
        {
          attribute: 'name',
          value: factory.stringNext(),
          url: `${BASE_URL}/update/${user.id}`
        },
        {
          attribute: 'email',
          value: faker.internet.email(),
          url: `${BASE_URL}/update/${user.id}`
        },
        {
          attribute: 'password',
          value: {
            currentPassword: factory.stringNext(),
            newPassword: factory.stringNext()
          },
          url: `${BASE_URL}/update/${user.id}`
        },
        {
          attribute: 'avatarUrl',
          value: faker.internet.url(),
          url: `${BASE_URL}/update/${user.id}`
        },
        {
          attribute: 'state',
          value: 'activate',
          url: `${BASE_URL}/update/${user.id}`
        },
        {
          attribute: 'state',
          value: 'lock',
          url: `${BASE_URL}/update/${user.id}`
        },
        {
          attribute: 'state',
          value: 'unlock',
          url: `${BASE_URL}/update/${user.id}`
        }
      ];
    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(user, testInfo.attribute, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(User));
          expect(s).toEqual(user);
        });

        const expectedJson = {
          expectedVersion: user.version,
          property: testInfo.attribute,
          newValue: testInfo.value
        };

        const req = httpMock.expectOne(testInfo.url);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(expectedJson);
        req.flush({ status: 'success', data: rawUser });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(user, testInfo.attribute, testInfo.value).subscribe(
          () => {
            fail('should have been an error response');
          },
          err => {
            expect(err.message).toContain('expected a user object');
          }
        );

        const req = httpMock.expectOne(testInfo.url);
        req.flush({ status: 'error', data: undefined });
        httpMock.verify();
      });
    });

    it('throws an exception for invalid input', () => {
      testData = [
        {
          attribute: factory.stringNext(),
          value: factory.stringNext(),
          url: `${BASE_URL}/name/${user.id}`,
          expectedErrMsg: /invalid attribute name/
        },
        {
          attribute: 'state',
          value: factory.stringNext(),
          url: `${BASE_URL}/unretire/${user.id}`,
          expectedErrMsg: /invalid state change/
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(user, testInfo.attribute, testInfo.value)).toThrowError(
          testInfo.expectedErrMsg
        );
      });
    });
  });
});
