import { Scene } from "./scene"
import { Stage } from "./stage"
import { Vector } from "./vector"
import { Vector2 } from "./vector2"




export type Input = {
  readonly stage: Stage

  readonly keys : Map<string, boolean>
  readonly btns : Map<number, boolean>
  mouse: Vector2
  wheel: Vector2
}

export const Input = {
  new(stage: Stage): Input {
    const keys = new Map<string, boolean>()
    const btns = new Map<number, boolean>()
    const mouse = Vector2.new()
    const wheel = Vector2.new()

    const input: Input = {
      stage,
      keys ,
      btns ,
      mouse,
      wheel,
    }

    document.onkeyup   = ke => Stage.emit(stage, "input:keyup"  , ke)
    document.onkeydown = ke => Stage.emit(stage, "input:keydown", ke)

    stage.logicalCanvasElement.onmouseup   = me => Stage.emit(stage, "input:mouseup"  , me)
    stage.logicalCanvasElement.onmousedown = me => Stage.emit(stage, "input:mousedown", me)
    stage.logicalCanvasElement.onmousemove = me => Stage.emit(stage, "input:mousemove", me)

    stage.logicalCanvasElement.onwheel = we => Stage.emit(stage, "input:wheel", we)

    Stage.on<KeyboardEvent>(stage, "input:keyup"    , ke => Input.__onKeyUp__    (input, ke))
    Stage.on<KeyboardEvent>(stage, "input:keydown"  , ke => Input.__onKeyDown__  (input, ke))
    Stage.on<MouseEvent   >(stage, "input:mouseup"  , me => Input.__onMouseUp__  (input, me))
    Stage.on<MouseEvent   >(stage, "input:mousedown", me => Input.__onMouseDown__(input, me))
    Stage.on<MouseEvent   >(stage, "input:mousemove", me => Input.__onMouseMove__(input, me))
    Stage.on<WheelEvent   >(stage, "input:wheel"    , we => Input.__onWheel__    (input, we))

    return input
  },

  isKeyUp  (i: Input, k: string) {
    return !(i.keys.get(k) ?? false)
  },

  isKeyDown(i: Input, k: string) {
    return  (i.keys.get(k) ?? false)
  },

  isMouseUp  (i: Input, b: number) {
    return !(i.btns.get(b) ?? false)
  },

  isMouseDown(i: Input, b: number) {
    return  (i.btns.get(b) ?? false)
  },

  isWheelUp  (i: Input) {
    // @ts-ignore
    const x = Vector.__get__.x(i.wheel)
    const y = Vector.__get__.y(i.wheel)
    return y > 0
  },

  isWheelDown(i: Input) {
    // @ts-ignore
    const x = Vector.__get__.x(i.wheel)
    const y = Vector.__get__.y(i.wheel)
    return y < 0
  },

  poll(i: Input) {
    i.wheel = Vector2.new()
  },

  __onKeyUp__    (i: Input, ke: KeyboardEvent) {
    if (Input.isKeyUp  (i, ke.key)) return

    i.keys.set(ke.key, false)
    Scene.keyUp(i.stage.scene, ke)
  },

  __onKeyDown__  (i: Input, ke: KeyboardEvent) {
    if (Input.isKeyDown(i, ke.key)) return

    i.keys.set(ke.key, true)
    Scene.keyDown(i.stage.scene, ke)
  },

  __onMouseUp__  (i: Input, me: MouseEvent) {
    if (Input.isMouseUp  (i, me.button)) return

    i.btns.set(me.button, false)
    Scene.mouseUp(i.stage.scene, me)
  },

  __onMouseDown__(i: Input, me: MouseEvent) {
    if (Input.isMouseDown(i, me.button)) return

    i.btns.set(me.button, true)
    Scene.mouseDown(i.stage.scene, me)
  },

  __onMouseMove__(i: Input, me: MouseEvent) {
    i.mouse = Stage.logicalToVirtual(i.stage, [
      me.offsetX,
      me.offsetY
    ])
    Scene.mouseMove(i.stage.scene, me)
  },

  __onWheel__(i: Input, we: WheelEvent) {
    i.wheel = [
      we.deltaX,
      we.deltaY
    ]
    Scene.wheel(i.stage.scene, we)
  },
}