import { Vector } from './vector'

export type Vector2 = [ number, number ]

export const Vector2 = {
  new(
    x ?: number, 
    y ?: number
  ): Vector2 {
    return (
      y === undefined
    ) ? [ x ??= 0, x     ] satisfies Vector2
      : [ x ??  0, y ?? 0] satisfies Vector2
  },

  toString(a: number | number[]) {
    const x = Vector.__get__.x(a)
    const y = Vector.__get__.y(a)
    return `vec2(${x}, ${y})`
  }
}