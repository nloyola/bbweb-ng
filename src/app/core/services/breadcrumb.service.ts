import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Crumb } from '@app/domain/crumb';
// borrowed from:
//
// https://github.com/McNull/ngx-breadcrumbs/blob/master/src/lib/mc-breadcrumbs/src/service/mc-breadcrumbs.service.ts
import { BehaviorSubject, concat, from, Observable, of } from 'rxjs';
import { distinct, filter, first, flatMap, toArray } from 'rxjs/operators';
import { template, templateSettings } from 'lodash';

const _ = {
  template: template,
  templateSettings: templateSettings
};

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  private breadcrumbs = new BehaviorSubject<Crumb[]>([]);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(x => x instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoot = router.routerState.snapshot.root;

        this.buildBreadcrumbs(currentRoot).pipe(
          flatMap((x) => x),
          distinct((x) => x.label),
          toArray(),
          flatMap((x) => {
            const y = this.postProcess(x);
            return this.wrapIntoObservable<Crumb[]>(y).pipe(first());
          }))
          .subscribe((x) => {
            this.breadcrumbs.next(x);
          });
      });
  }

  get crumbs$(): Observable<Crumb[]> {
    return this.breadcrumbs;
  }

  private postProcess(x: Crumb[]): Crumb[] {
    if (x.length && (x[0].label !== 'Home')) {
      return [{ label: 'Home', path: '' }].concat(x);
    }
    return x;
  }

  private buildBreadcrumbs(route: ActivatedRouteSnapshot): Observable<Crumb[]> {
    let crumbs$: Observable<Crumb[]>;

    const data = route.routeConfig && route.routeConfig.data;
    if (data && data.breadcrumbs) {

      const result = this.resolve(route, this.router.routerState.snapshot);
      crumbs$ = this.wrapIntoObservable<Crumb[]>(result).pipe(first());

    } else {
      crumbs$ = of([]);
    }

    if (route.firstChild) {
      crumbs$ = concat(crumbs$, this.buildBreadcrumbs(route.firstChild));
    }

    return crumbs$;
  }

  private resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot)
    : Observable<Crumb[]> | Promise<Crumb[]> | Crumb[] {

    const data = route.routeConfig.data;
    const path = this.getFullPath(route);

    let label = typeof (data.breadcrumbs) === 'string'
      ? data.breadcrumbs : data.breadcrumbs.text || data.text || path;
    label = this.stringFormat(label, route.data);

    const crumbs: Crumb[] = [{ label: label, path: path }];

    return of(crumbs);
  }

  private getFullPath(route: ActivatedRouteSnapshot): string {
    const relativePath = (segments: UrlSegment[]) => segments.reduce((a, v) => a += '/' + v.path, '');
    const fullPath =
      (routes: ActivatedRouteSnapshot[]) => routes.reduce((a, v) => a += relativePath(v.url), '');

    return fullPath(route.pathFromRoot);
  }

  private wrapIntoObservable<T>(value: T | Promise<T> | Observable<T>)
    : Observable<T> {

    if (value instanceof Observable) {
      return value;
    }

    if (this.isPromise(value)) {
      return from(Promise.resolve(value));
    }

    return of(value as T);
  }

  private isPromise(value: any): boolean {
    return value && (typeof value.then === 'function');
  }

  private stringFormat(tplt: string, binding: any): string {
    const compiled = _.template(tplt);
    return compiled(binding);
  }

}
