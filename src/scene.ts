import type { Stage } from "./stage"

export type Scene = {
  onAttach ?: (s: Stage) => void,
  onDetach ?: (s: Stage) => void,
  onRender ?: (c: Scene.RenderContext) => void,
  onUpdate ?: (c: Scene.UpdateContext) => void,
}

export namespace Scene {
  export type UpdateContext = {
    s  : Stage,

    t  : number,
    dt : number,
    lw : number,
    lh : number,
    vw : number,
    vh : number,
    vs : number,
  }

  export type RenderContext = {
    s  : Stage,

    t  : number,
    dt : number,
    lw : number,
    lh : number,
    vw : number,
    vh : number,
    vs : number,

    g: OffscreenCanvasRenderingContext2D,
  }
}

export const Scene = {
  render(s: Scene | undefined, c: Scene.RenderContext) {
    if (s && s.onRender) s.onRender(c)
  },

  update(s: Scene | undefined, c: Scene.UpdateContext) {
    if (s && s.onUpdate) s.onUpdate(c)
  },

  attach(s: Scene | undefined, c: Stage) {
    if (s && s.onAttach) s.onAttach(c)
  },

  detach(s: Scene | undefined, c: Stage) {
    if (s && s.onDetach) s.onDetach(c)
  },
}