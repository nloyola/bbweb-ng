import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { PagedReply, ConcurrencySafeEntity, SearchParams } from '@app/domain';
import { Observable } from 'rxjs';
import '@test/matchers/server-api.matchers';

export namespace PagedQueryBehaviour {
  export interface Context<T extends ConcurrencySafeEntity> {
    url?: string;
    replyItems?: any;
    search?(searchParams: SearchParams): Observable<PagedReply<T>>;
    subscription?(pr: PagedReply<T>): any;
  }

  export function sharedBehaviour<T extends ConcurrencySafeEntity>(context: Context<T>) {
    describe('shared behaviour', () => {
      let httpMock: HttpTestingController;
      let reply: any;

      beforeEach(() => {
        httpMock = TestBed.get(HttpTestingController);
        reply = {
          items: [context.replyItems],
          page: 1,
          limit: 10,
          offset: 0,
          total: context.replyItems.length
        };
      });

      it('can retrieve entities', done => {
        const obs = context.search({});
        obs.subscribe((pr: PagedReply<T>) => {
          context.subscription(pr);
          expect(pr.offset).toBe(reply.offset);
          expect(pr.total).toBe(reply.total);
          done();
        });
        const req = httpMock.expectOne(context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).toEqual([]);
        req.flush({ status: 'success', data: reply });
        httpMock.verify();
      });

      it('uses the `filter` query parameter', done => {
        const filter = 'name:like:test';
        const params = { filter };
        context.search(params).subscribe((pr: PagedReply<T>) => {
          expect(pr.entities.length).toBe(context.replyItems.length);
          expect(pr.offset).toBe(reply.offset);
          expect(pr.total).toBe(reply.total);
          context.subscription(pr);
          done();
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('filter')).toBe(filter);

        req.flush({ status: 'success', data: reply });
      });

      it('uses the `sort` query parameter', done => {
        const sort = '-name';
        const params = { sort };
        context.search(params).subscribe((pr: PagedReply<T>) => {
          expect(pr.entities.length).toBe(context.replyItems.length);
          done();
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('sort')).toBe(sort);

        req.flush({ status: 'success', data: reply });
      });

      it('uses the `page` query parameter', done => {
        const page = 2;
        const params = { page };
        context.search(params).subscribe((pr: PagedReply<T>) => {
          expect(pr.entities.length).toBe(context.replyItems.length);
          done();
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('page')).toBe(page);

        req.flush({ status: 'success', data: reply });
      });

      it('uses the `limit` query parameter', done => {
        const limit = 10;
        const params = { limit };
        context.search(params).subscribe((pr: PagedReply<T>) => {
          expect(pr.entities.length).toBe(context.replyItems.length);
          done();
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('limit')).toBe(limit);

        req.flush({ status: 'success', data: reply });
      });

      it('handles an error reply correctly', () => {
        const params = {};
        const obs = context.search(params);
        expect(obs).toBeHttpError(httpMock, 'GET', context.url, 'expected a paged reply');
      });
    });
  }
}
