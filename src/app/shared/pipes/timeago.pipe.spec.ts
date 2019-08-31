import { NgZone } from '@angular/core';

import { TimeagoPipe } from './timeago.pipe';

class NgZoneMock {
  runOutsideAngular(fn: Function) {
    return fn();
  }
  run(fn: Function) {
    return fn();
  }
}

describe('Timeago Pipe', () => {
  let pipe: TimeagoPipe;

  beforeEach(() => {
    pipe = new TimeagoPipe(null, new NgZoneMock() as NgZone);
  });

  it('seconds ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setSeconds(modifiedDate.getSeconds() - 1);
    expect(pipe.transform(modifiedDate.toString())).toBe('a few seconds ago');
  });

  it('minutes ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setMinutes(modifiedDate.getMinutes() - 1);
    expect(pipe.transform(modifiedDate.toString())).toBe('a minute ago');
  });

  it('more than a minute ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setMinutes(modifiedDate.getMinutes() - 2);
    expect(pipe.transform(modifiedDate.toString())).toBe('2 minutes ago');
  });

  it('hour ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setHours(modifiedDate.getHours() - 1);
    expect(pipe.transform(modifiedDate.toString())).toBe('an hour ago');
  });

  it('more than an hour ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setHours(modifiedDate.getHours() - 2);
    expect(pipe.transform(modifiedDate.toString())).toBe('2 hours ago');
  });

  it('day ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setDate(modifiedDate.getDate() - 1);
    expect(pipe.transform(modifiedDate.toString())).toBe('a day ago');
  });

  it('more than a day ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setDate(modifiedDate.getDate() - 2);
    expect(pipe.transform(modifiedDate.toString())).toBe('2 days ago');
  });

  it('month ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setMonth(modifiedDate.getMonth() - 1);
    expect(pipe.transform(modifiedDate.toString())).toBe('a month ago');
  });

  it('more than a month ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setMonth(modifiedDate.getMonth() - 2);
    expect(pipe.transform(modifiedDate.toString())).toBe('2 months ago');
  });

  it('year ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setFullYear(modifiedDate.getFullYear() - 1);
    expect(pipe.transform(modifiedDate.toString())).toBe('a year ago');
  });

  it('more than a year ago', () => {
    const modifiedDate = new Date();
    modifiedDate.setFullYear(modifiedDate.getFullYear() - 2);
    expect(pipe.transform(modifiedDate.toString())).toBe('2 years ago');
  });

  it('for a non date value', () => {
    expect(pipe.transform('xxxx')).toBe('');
  });
});
