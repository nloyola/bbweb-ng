import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Membership } from '@app/domain/access';
import { PagedQueryBehaviour } from '@test/behaviours/paged-query.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { MembershipService } from './membership.service';
import { AnnotationType } from '@app/domain/annotations';

describe('MembershipService', () => {

  const BASE_URL = '/api/access/memberships';

  let httpMock: HttpTestingController;
  let service: MembershipService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [MembershipService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(MembershipService);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when requesting a membership', () => {
    let rawMembership: any;
    let membership: Membership;

    beforeEach(() => {
      rawMembership = factory.membership();
      membership = new Membership().deserialize(rawMembership);
    });

    it('reply is handled correctly', () => {
      service.get(membership.slug).subscribe(s => {
        expect(s).toEqual(jasmine.any(Membership));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${membership.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawMembership });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.get(membership.slug).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a membership object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${membership.slug}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when searching memberships', () => {
    let rawMembership: any;
    let reply: any;

    beforeEach(() => {
      rawMembership = factory.membership();
      reply = {
        items: [ rawMembership ],
        page: 1,
        limit: 10,
        offset: 0,
        total: 1
      };
    });

    it('can retrieve memberships', () => {
      const params = new SearchParams();
      service.search(params).subscribe((pr: PagedReply<Membership>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Membership));
        expect(pr.offset).toBe(reply.offset);
        expect(pr.total).toBe(reply.total);
      });

      const req = httpMock.expectOne(r => r.url === BASE_URL);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({
        status: 'success',
        data: reply
      });
      httpMock.verify();
    });

    describe('uses valid query parameters', function () {

      const context: PagedQueryBehaviour.Context<Membership> = {};

      beforeEach(() => {
        context.search = (searchParams: SearchParams) => service.search(searchParams);
        context.url = BASE_URL;
        context.reply = reply;
      });

      PagedQueryBehaviour.sharedBehaviour(context);

    });

    it('handles an error reply correctly', () => {
      const params = new SearchParams();
      service.search(params).subscribe(
        u => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a paged reply'); }
      );

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when adding a membership', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawMembership = factory.membership();
      const membership = new Membership().deserialize(rawMembership);

      service.add(membership).subscribe(s => {
        expect(s).toEqual(jasmine.any(Membership));
        expect(s).toEqual(membership);
      });

      const req = httpMock.expectOne(BASE_URL);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: membership.name,
        description: membership.description,
        userIds: [],
        allStudies: false,
        studyIds: [],
        allCentres: false,
        centreIds: []
      });
      req.flush({ status: 'success', data: rawMembership });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawMembership = factory.membership();
      const membership = new Membership().deserialize(rawMembership);

      service.add(membership).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a membership object'); }
      );

      const req = httpMock.expectOne(BASE_URL);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for updating a membership', () => {

    let rawMembership: any;
    let membership: Membership;
    let testData: any;

    beforeEach(() => {
      const user = factory.user();
      const study = factory.study();
      const centre = factory.centre();

      rawMembership = factory.membership();
      membership = new Membership().deserialize(rawMembership);
      testData = [
        {
          attribute: 'name',
          value: factory.stringNext(),
          url: `${BASE_URL}/name/${membership.id}`
        },
        {
          attribute: 'description',
          value: faker.lorem.paragraph(),
          url: `${BASE_URL}/description/${membership.id}`
        },
        {
          attribute: 'description',
          value: undefined,
          url: `${BASE_URL}/description/${membership.id}`
        },
        {
          attribute: 'userAdd',
          value: user.id,
          url: `${BASE_URL}/user/${membership.id}`
        },
        {
          attribute: 'userRemove',
          value: user.id,
          url: `${BASE_URL}/user/${membership.id}/${membership.version}/${user.id}`
        },
        {
          attribute: 'allStudies',
          value: study.id,
          url: `${BASE_URL}/allStudies/${membership.id}`
        },
        {
          attribute: 'studyAdd',
          value: study.id,
          url: `${BASE_URL}/study/${membership.id}`
        },
        {
          attribute: 'studyRemove',
          value: study.id,
          url: `${BASE_URL}/study/${membership.id}/${membership.version}/${study.id}`
        },
        {
          attribute: 'allCentres',
          value: study.id,
          url: `${BASE_URL}/allCentres/${membership.id}`
        },
        {
          attribute: 'centreAdd',
          value: centre.id,
          url: `${BASE_URL}/centre/${membership.id}`
        },
        {
          attribute: 'centreRemove',
          value: centre.id,
          url: `${BASE_URL}/centre/${membership.id}/${membership.version}/${centre.id}`
        }
      ];

    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(membership, testInfo.attribute, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(Membership));
          expect(s).toEqual(membership);
        });

        const expectedJson = { expectedVersion: membership.version };

        switch (testInfo.attribute) {
          case 'state':
          case 'allStudies':
          case 'allCentres':
            // empty
            break;

          case 'userAdd':
            expectedJson['userId'] = testInfo.value;
            break;

          case 'studyAdd':
            expectedJson['studyId'] = testInfo.value;
            break;

          case 'centreAdd':
            expectedJson['centreId'] = testInfo.value;
            break;

          default:
            expectedJson[testInfo.attribute] = testInfo.value;
        }

        const req = httpMock.expectOne(testInfo.url);

        if (['userRemove', 'studyRemove', 'centreRemove'].includes(testInfo.attribute)) {
          expect(req.request.method).toBe('DELETE');
        } else {
          expect(req.request.method).toBe('POST');
          expect(req.request.body).toEqual(expectedJson);
        }

        req.flush({ status: 'success', data: rawMembership });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(membership, testInfo.attribute, testInfo.value).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a membership object'); }
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
          url: `${BASE_URL}/name/${membership.id}`,
          expectedErrMsg: /invalid attribute name/
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(membership, testInfo.attribute, testInfo.value))
          .toThrowError(testInfo.expectedErrMsg);
      });
    });
  });

  describe('for removing a membership', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawMembership = factory.membership();
      const membership = new Membership().deserialize(rawMembership);

      service.removeMembership(membership).subscribe(id => {
        expect(id).toEqual(membership.id);
      });

      const url = `${BASE_URL}/${membership.id}/${membership.version}`;
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', data: membership.id });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawMembership = factory.membership();
      const membership = new Membership().deserialize(rawMembership);

      service.removeMembership(membership).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a membership object'); }
      );

      const url = `${BASE_URL}/${membership.id}/${membership.version}`;
      const req = httpMock.expectOne(url);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

});
