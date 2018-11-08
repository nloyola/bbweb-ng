import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { PagedReply, ConcurrencySafeEntity, SearchParams } from '@app/domain';
import { Observable } from 'rxjs';

export namespace PagedQueryBehaviour {

  export interface Context<T extends ConcurrencySafeEntity> {

    url?: string;

    search?(searchParams: SearchParams): Observable<PagedReply<T>>;

    reply?: any;

  }

  export function sharedBehaviour<T extends ConcurrencySafeEntity>(context: Context<T>) {

    describe('shared behaviour', () => {

      let httpMock: HttpTestingController;

      beforeEach(() => {
        httpMock = TestBed.get(HttpTestingController);
      });

      it('uses the `filter` query parameter', () => {
        const filter = 'name:like:test';
        const params = new SearchParams(filter);
        context.search(params).subscribe((pr: PagedReply<T>) => {
          expect(pr.entities.length).toBe(context.reply.items.length);
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('filter')).toBe(filter);

        req.flush({
          status: 'success',
          data: context.reply
        });
      });

      it('uses the `sort` query parameter', () => {
        const sort = '-name';
        const params = new SearchParams(undefined, sort);
        context.search(params).subscribe((pr: PagedReply<T>) => {
          expect(pr.entities.length).toBe(context.reply.items.length);
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('sort')).toBe(sort);

        req.flush({
          status: 'success',
          data: context.reply
        });
      });

      it('uses the `page` query parameter', () => {
        const page = 2;
        const params = new SearchParams(undefined, undefined, page);
        context.search(params).subscribe((pr: PagedReply<T>) => {
          expect(pr.entities.length).toBe(context.reply.items.length);
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('page')).toBe(String(page));

        req.flush({
          status: 'success',
          data: context.reply
        });
      });

      it('uses the `limit` query parameter', () => {
        const limit = 10;
        const params = new SearchParams(undefined, undefined, undefined, limit);
        context.search(params).subscribe((pr: PagedReply<T>) => {
          expect(pr.entities.length).toBe(context.reply.items.length);
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('limit')).toBe(String(limit));

        req.flush({
          status: 'success',
          data: context.reply
        });
      });

    });

  }
}
