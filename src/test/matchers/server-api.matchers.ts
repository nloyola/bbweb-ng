import { HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';

declare global {
  namespace jest {
    interface Matchers<R> {

      toBeHttpSuccess(
        httpMock: HttpTestingController,
        method: string,
        url: string,
        reply: any,
        bodyMatcher?: (body: any) => void
      ): R;

      toBeHttpError(
        httpMock: HttpTestingController,
        method: string,
        url: string,
        errorMessage: string
      ): R;
    }
  }
}

(expect as any).extend({
  toBeHttpSuccess(
    _obs: Observable<any>,
    httpMock: HttpTestingController,
    method: string,
    url: string,
    reply: any,
    bodyMatcher?: (body: any) => void
  ): jest.CustomMatcherResult {
    const req = httpMock.expectOne(url);
    req.flush({ status: 'success', data: reply });
    const pass = req.request.method === method;
    if (bodyMatcher) { bodyMatcher(req.request.body); }
    httpMock.verify();
    const message = pass ?
      () => this.utils.matcherHint('.not.toBeHttpSuccess', req.request.method, method)
      : () => this.utils.matcherHint('toBeHttpSuccess', req.request.method, method);
    return { pass, message };
  },

  toBeHttpError(
    obs: Observable<any>,
    httpMock: HttpTestingController,
    method: string,
    url: string,
    errorMessage: string
  ): jest.CustomMatcherResult {
    obs.subscribe(
      () => { fail('should have been an error response'); },
      err => { expect(err.message).toContain(errorMessage); }
    );
    const req = httpMock.expectOne(url);
    req.flush({ status: 'error', data: undefined });
    const pass = req.request.method === method;
    httpMock.verify();
    const message = pass ?
      () => this.utils.matcherHint('.not.toBeHttpError', req.request.method, method)
      : () => this.utils.matcherHint('toBeHttpError', req.request.method, method);
    return { pass, message };
  }
});
