import { TruncatePipe } from './truncate.pipe';

describe('Truncate Pipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('truncates text to a specified length', () => {
    const text = '123456789 123456789 123456789 123456789 123456789 123456789 123456789';

    expect(pipe.transform(text, 20)).toBe('123456789 1234567...');
  });

  it('truncates with the specified suffix', () => {
    const text = '123456789 123456789 123456789 123456789 123456789 123456789 123456789';

    expect(pipe.transform(text, 20, '***')).toBe('123456789 1234567***');
  });

  it('does not truncate text if less than length', () => {
    const text = '123456789 ';
    expect(pipe.transform(text, 20)).toBe(text);
  });

  it('truncate to default length if not specified', () => {
    const text = '123456789 123456789 ';
    expect(pipe.transform(text, undefined)).toBe('1234567...');
  });

  it('returns empty string if input not specified', () => {
    expect(pipe.transform(undefined, undefined)).toBe('');
  });
});
