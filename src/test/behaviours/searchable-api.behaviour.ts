import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HasName, HasSlug, IDomainEntity, IEntityInfoAndState, SearchParams } from '@app/domain';
import '@test/matchers/server-api.matchers';
import { Observable } from 'rxjs';

export namespace SearchableApiBehaviour {

  /* tslint:disable-next-line:max-line-length */
  export interface Context<E extends IDomainEntity & HasSlug & HasName, S, T extends IEntityInfoAndState<E, S>> {
    url?: string;
    replyItems?: any;
    search?(searchParams: SearchParams): Observable<T[]>;
    subscription?(entities: T[]): void;
  }

  /* tslint:disable-next-line:max-line-length */
  export function sharedBehaviour<E extends IDomainEntity & HasSlug & HasName, S, T extends IEntityInfoAndState<E, S>>(
    context: Context<E, S, T>
  ) {

    describe('shared behaviour', () => {

      let httpMock: HttpTestingController;
      let reply: any;

      beforeEach(() => {
        httpMock = TestBed.get(HttpTestingController);
        reply = context.replyItems;
      });

      it('can retrieve entities', done => {
        const params = new SearchParams();
        const obs = context.search(params);
        obs.subscribe((entities: T[]) => {
          context.subscription(entities);
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
        const params = new SearchParams(filter);
        context.search(params).subscribe((entities: T[]) => {
          context.subscription(entities);
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
        const params = new SearchParams(undefined, sort);
        context.search(params).subscribe((entities: T[]) => {
          context.subscription(entities);
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
        const params = new SearchParams(undefined, undefined, page);
        context.search(params).subscribe((entities: T[]) => {
          context.subscription(entities);
          done();
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('page')).toBe(String(page));

        req.flush({ status: 'success', data: reply });
      });

      it('uses the `limit` query parameter', done => {
        const limit = 10;
        const params = new SearchParams(undefined, undefined, undefined, limit);
        context.search(params).subscribe((entities: T[]) => {
          context.subscription(entities);
          done();
        });

        const req = httpMock.expectOne(r => r.url === context.url);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys()).not.toEqual([]);
        expect(req.request.params.get('limit')).toBe(String(limit));

        req.flush({ status: 'success', data: reply });
      });

      it('handles an error reply correctly', () => {
        const params = new SearchParams();
        const obs = context.search(params);
        expect(obs).toBeHttpError(httpMock, 'GET', context.url, 'expected a paged reply');
      });

    });

  }
}
