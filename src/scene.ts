import { Stage } from "./stage"
import type { Vector2 } from "./vector2"

export type Scene = {
  stage ?: Stage,

  onAttach ?: (stage: Stage) => void,
  onDetach ?: (stage: Stage) => void,
  onRender ?: (c: Scene.RenderContext) => void,
  onUpdate ?: (c: Scene.UpdateContext) => void,

  onKeyUp     ?: (k: string ) => void,
  onKeyDown   ?: (k: string ) => void,
  onMouseUp   ?: (b: number ) => void,
  onMouseDown ?: (b: number ) => void,
  onMouseMove ?: (m: Vector2) => void,
  onWheel     ?: (w: Vector2) => void,
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
  attach(maybeScene: Scene | undefined, stage: Stage) {
    if (maybeScene) {
      maybeScene.stage = stage
      if (maybeScene.onAttach)
        maybeScene.onAttach(stage)
    }
  },
  
  detach(maybeScene: Scene | undefined, stage: Stage) {
    if (maybeScene) {
      if (maybeScene.onDetach)
        maybeScene.onDetach(stage)
      maybeScene.stage = undefined
    }
  },

  render(maybeScene: Scene | undefined, c: Scene.RenderContext) {
    if (maybeScene && maybeScene.onRender) maybeScene.onRender(c)
  },

  update(maybeScene: Scene | undefined, c: Scene.UpdateContext) {
    if (maybeScene && maybeScene.onUpdate) maybeScene.onUpdate(c)
  },

  keyUp    (maybeScene: Scene | undefined, ke: KeyboardEvent) {
    if (maybeScene && maybeScene.onKeyUp    ) maybeScene.onKeyUp    (ke.key)
  },

  keyDown  (maybeScene: Scene | undefined, ke: KeyboardEvent) {
    if (maybeScene && maybeScene.onKeyDown  ) maybeScene.onKeyDown  (ke.key)
  },

  mouseUp  (maybeScene: Scene | undefined, me: MouseEvent) {
    if (maybeScene && maybeScene.onMouseUp  ) maybeScene.onMouseUp  (me.button)
  },

  mouseDown(maybeScene: Scene | undefined, me: MouseEvent) {
    if (maybeScene && maybeScene.onMouseDown) maybeScene.onMouseDown(me.button)
  },

  mouseMove(maybeScene: Scene | undefined, me: MouseEvent) {
    if (maybeScene && maybeScene.onMouseMove) maybeScene.onMouseMove(
      Stage.logicalToVirtual(
        maybeScene.stage!, [
        me.offsetX,
        me.offsetY
      ])
    )
  },

  wheel(maybeScene: Scene | undefined, we: WheelEvent) {
    if (maybeScene && maybeScene.onWheel) maybeScene.onWheel([
      we.deltaX,
      we.deltaY
    ])
  },
}