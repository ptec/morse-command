export const Vector = {
  __get__: {
    x(a: number | number[]) { return typeof a === 'number' ? a : a[0] ?? 0 },
    y(a: number | number[]) { return typeof a === 'number' ? 0 : a[1] ?? 0 },
    z(a: number | number[]) { return typeof a === 'number' ? 0 : a[2] ?? 0 },
    w(a: number | number[]) { return typeof a === 'number' ? 0 : a[3] ?? 0 },
    n(a: number | number[]) { return typeof a === 'number' ? 1 : a.length  },
  },

  __set__: {
    x(a: number | number[], x: number) { return typeof a === 'number' ? x : (a[0] ??= x) },
    y(a: number | number[], y: number) { return typeof a === 'number' ? y : (a[1] ??= y) },
    z(a: number | number[], z: number) { return typeof a === 'number' ? z : (a[2] ??= z) },
    w(a: number | number[], w: number) { return typeof a === 'number' ? w : (a[3] ??= w) },
  }
}