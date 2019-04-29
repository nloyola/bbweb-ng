import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Role } from '@app/domain/access';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { RoleService } from './role.service';
import { AnnotationType } from '@app/domain/annotations';

describe('RoleService', () => {

  const BASE_URL = '/api/access/roles';

  let httpMock: HttpTestingController;
  let service: RoleService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [RoleService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(RoleService);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when requesting a role', () => {
    let rawRole: any;
    let role: Role;

    beforeEach(() => {
      rawRole = factory.role();
      role = new Role().deserialize(rawRole);
    });

    it('reply is handled correctly', () => {
      service.get(role.slug).subscribe(s => {
        expect(s).toEqual(jasmine.any(Role));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${role.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawRole });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.get(role.slug).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a role object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${role.slug}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when searching roles', () => {

    const context: PagedQueryBehaviour.Context<Role> = {};

    beforeEach(() => {
      context.search = (searchParams: SearchParams) => service.search(searchParams);
      context.url = BASE_URL;
      context.replyItems = [ factory.role() ];
      context.subscription = (pr: PagedReply<Role>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Role));
      };
    });

    PagedQueryBehaviour.sharedBehaviour(context);

  });

  describe('for updating a role', () => {

    let rawRole: any;
    let role: Role;
    let testData: any;

    beforeEach(() => {
      const user = factory.user();

      rawRole = factory.role();
      role = new Role().deserialize(rawRole);
      testData = [
        {
          attribute: 'userAdd',
          value: user.id,
          url: `${BASE_URL}/user/${role.id}`
        },
        {
          attribute: 'userRemove',
          value: user.id,
          url: `${BASE_URL}/user/${role.id}/${role.version}/${user.id}`
        }
      ];

    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(role, testInfo.attribute, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(Role));
          expect(s).toEqual(role);
        });

        const expectedJson = { expectedVersion: role.version };

        switch (testInfo.attribute) {
          case 'userAdd':
            expectedJson['userId'] = testInfo.value;
            break;

          default:
            expectedJson[testInfo.attribute] = testInfo.value;
        }

        const req = httpMock.expectOne(testInfo.url);

        if (testInfo.attribute === 'userRemove') {
          expect(req.request.method).toBe('DELETE');
        } else {
          expect(req.request.method).toBe('POST');
          expect(req.request.body).toEqual(expectedJson);
        }

        req.flush({ status: 'success', data: rawRole });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(role, testInfo.attribute, testInfo.value).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a role object'); }
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
          url: `${BASE_URL}/name/${role.id}`,
          expectedErrMsg: /invalid attribute name/
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(role, testInfo.attribute, testInfo.value))
          .toThrowError(testInfo.expectedErrMsg);
      });
    });
  });

});
