export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype,
                            name,
                            Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}

// this function taken from here:
// https://gist.github.com/mathewbyrne/1280286
export function slugify(text: string): string {
  return text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}
