import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { StudyService } from './study.service';
import { Study } from '@app/domain/studies';
import { Factory } from '@app/test/factory';
import { ValueTypes, MaxValueCount } from '@app/domain/annotations';
import { PagedReply } from '@app/domain';
import { PagedQueryBehaviour } from '@app/test/behaviours/paged-query.behaviour';

describe('StudyService', () => {

  const BASE_URL = '/api/studies';

  let httpMock: HttpTestingController;
  let service: StudyService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [StudyService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(StudyService);
    factory = new Factory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when requesting a study', () => {
    let annotationType;
    let rawStudy;
    let study;

    beforeEach(() => {
      annotationType = factory.annotationType();
      rawStudy = factory.study({ annotationTypes: [annotationType] });
      study = new Study().deserialize(rawStudy);
    });

    it('reply is handled correctly', () => {
      service.get(study.slug).subscribe(s => {
        expect(s).toEqual(jasmine.any(Study));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawStudy });
    });

    it('handles and error reply correctly', () => {
      service.get(study.slug).subscribe(
        u => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${study.slug}`);
      req.flush({ status: 'error', data: undefined });
    });

  });

  describe('when searching studies', () => {
    let rawStudy;
    let study;
    let reply;

    beforeEach(() => {
      rawStudy = factory.study();
      study = new Study().deserialize(rawStudy);
      reply = {
        items: [ rawStudy ],
        page: 1,
        limit: 10,
        offset: 0,
        total: 1
      };
    });

    it('can retrieve studies', () => {
      service.search().subscribe((pr: PagedReply<Study>) => {
        expect(pr.entities.length).toBe(1);
        expect(pr.entities[0]).toEqual(jasmine.any(Study));
        expect(pr.page).toBe(reply.page);
        expect(pr.limit).toBe(reply.limit);
        expect(pr.offset).toBe(reply.offset);
        expect(pr.total).toBe(reply.total);
      });

      const req = httpMock.expectOne(r => r.url === `${BASE_URL}/search`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({
        status: 'success',
        data: reply
      });
    });

    describe('uses valid query parameters', function () {

      const context: PagedQueryBehaviour.Context<Study> = {};

      beforeEach(() => {
        context.service = service;
        context.url = `${BASE_URL}/search`;
        context.reply = reply;
      });

      PagedQueryBehaviour.sharedBehaviour(context);

    });

    it('handles and error reply correctly', () => {
      service.search().subscribe(
        u => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a paged reply'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/search`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'error', data: undefined });
    });

  });

  describe('when adding a study', () => {
    let rawStudy;
    let study;

    beforeEach(() => {
      rawStudy = factory.study();
      study = new Study().deserialize(rawStudy);
    });

    it('request contains correct JSON and reply is handled correctly', () => {
      service.add(study).subscribe(s => {
        expect(s).toEqual(jasmine.any(Study));
        expect(s).toEqual(study);
      });

      const req = httpMock.expectOne(`${BASE_URL}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: study.name,
        description: study.description
      });
      req.flush({ status: 'success', data: rawStudy });
    });

    it('handles and error reply correctly', () => {
      service.add(study).subscribe(
        u => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a study object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/`);
      req.flush({ status: 'error', data: undefined });
    });

  });

});
