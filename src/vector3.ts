import { Vector } from './vector'

export type Vector3 = [ number, number, number ]

export const Vector3 = {
  new(
    x ?: number, 
    y ?: number, 
    z ?: number
  ): Vector3 {
    return (
      y === undefined &&
      z === undefined
    ) ? [ x ??= 0, x     , x     ] satisfies Vector3
      : [ x ??  0, y ?? 0, z ?? 0] satisfies Vector3
  },

  toString(a: number | number[]) {
    const x = Vector.__get__.x(a)
    const y = Vector.__get__.y(a)
    const z = Vector.__get__.z(a)
    return `vec3(${x}, ${y}, ${z})`
  }
}