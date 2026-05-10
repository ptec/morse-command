import { Channel, type Handler } from "./channel"
import { Scene } from "./scene"
import { Vector2 } from "./vector2"

export type Stage = {
  readonly __configureDebug__            : boolean,
  readonly __configureWidth__            : number ,
  readonly __configureHeight__           : number ,
  readonly __configureLogicalBackground__: string ,
  readonly __configureVirtualBackground__: string ,
  readonly __configureScaleIncrement__  ?: number ,
  readonly __configureImageSmoothing__  ?: ImageSmoothingQuality

  logicalCanvasElement: HTMLCanvasElement,
  virtualCanvasElement: OffscreenCanvas,
  logicalCanvasContext: CanvasRenderingContext2D,
  virtualCanvasContext: OffscreenCanvasRenderingContext2D,
  virtualScale: number

  events: Channel,

  scene: Scene | undefined,
}

export const Stage = {
  new(o ?: {
    c     ?: HTMLCanvasElement,
    debug ?: boolean,
    w     ?: number ,
    h     ?: number ,
    bg    ?: string ,
    lbg   ?: string ,
    vbg   ?: string ,
    si    ?: number ,
    is    ?: ImageSmoothingQuality
  }): Stage {
    const __configureDebug__             = o?.debug ?? false
    const __configureWidth__             = o?.w     ?? 0
    const __configureHeight__            = o?.h     ?? 0
    const __configureLogicalBackground__ = o?.lbg   ?? o?.bg ?? "#000"
    const __configureVirtualBackground__ = o?.vbg   ?? o?.bg ?? "#fff"
    const __configureScaleIncrement__    = o?.si
    const __configureImageSmoothing__    = o?.is

    const logicalCanvasElement = o?.c ?? Stage.__canvas__
    const virtualCanvasElement = new OffscreenCanvas(
      __configureWidth__  || logicalCanvasElement.width,
      __configureHeight__ || logicalCanvasElement.height
    )

    const logicalCanvasContext = logicalCanvasElement.getContext("2d")!
    const virtualCanvasContext = virtualCanvasElement.getContext("2d")!

    // image smoothing
    logicalCanvasContext.imageSmoothingEnabled = !!__configureImageSmoothing__
    virtualCanvasContext.imageSmoothingEnabled = !!__configureImageSmoothing__
    if (__configureImageSmoothing__) {
      logicalCanvasContext.imageSmoothingQuality = __configureImageSmoothing__
      virtualCanvasContext.imageSmoothingQuality = __configureImageSmoothing__
    }

    // scale increment
    let virtualScale = Math.min(
      logicalCanvasElement.width  / virtualCanvasElement.width,
      logicalCanvasElement.height / virtualCanvasElement.height
    )
    if (!!__configureScaleIncrement__)
      virtualScale = Math.max(__configureScaleIncrement__, Math.floor(virtualScale / __configureScaleIncrement__) * __configureScaleIncrement__)

    const events = Channel.new()
    
    const stage: Stage = {
      __configureDebug__            ,
      __configureWidth__            ,
      __configureHeight__           ,
      __configureLogicalBackground__,
      __configureVirtualBackground__,
      __configureScaleIncrement__   ,
      __configureImageSmoothing__   ,

      logicalCanvasElement,
      virtualCanvasElement,
      logicalCanvasContext,
      virtualCanvasContext,
      virtualScale,

      events,
      scene: undefined,
    }

    new ResizeObserver(() => Stage.__resize__(stage)).observe(logicalCanvasElement)

    Stage.on<Vector2          >(stage, "stage:resize", resize => Stage.__onResize__(stage, resize))
    Stage.on<Scene | undefined>(stage, "stage:change", change => Stage.__onChange__(stage, change))

    requestAnimationFrame(
      t0 => requestAnimationFrame(
        t1 => requestAnimationFrame(
          t2 => Stage.animate(stage, t0, t1, t2))))

    return stage
  },

  cue(s: Stage, c: Scene | undefined) {
    Stage.emit(s, "stage:change", c)
  },

  getLogicalSize(s: Stage) {
    return Vector2.new(
      s.logicalCanvasElement.width,
      s.logicalCanvasElement.height
    )
  },

  getVirtualSize(s: Stage) {
    return Vector2.new(
      s.virtualCanvasElement.width,
      s.virtualCanvasElement.height
    )
  },

  getVirtualScale(s: Stage) {
    return s.virtualScale
  },

  on  <T>(s: Stage, when: string, then: Handler<T>, defer=true) {
    Channel.on  (s.events, when, then, defer)
  },

  off <T>(s: Stage, when: string, then: Handler<T>, defer=true) {
    Channel.off (s.events, when, then, defer)
  },

  emit<T>(s: Stage, when: string, what: T, defer=true) {
    Channel.emit(s.events, when, what, defer)
  },

  poll(s: Stage) {
    Channel.poll(s.events)
  },

  update(s: Stage, t: number, dt: number) {
    const [lw, lh] = Stage.getLogicalSize (s)
    const [vw, vh] = Stage.getVirtualSize (s)
    const vs       = Stage.getVirtualScale(s)

    Scene.update(s.scene, {s, t, dt, lw, lh, vw, vh, vs})
  },

  render(s: Stage, t: number, dt: number) {
    const h = s.logicalCanvasContext
    const g = s.virtualCanvasContext

    const [lw, lh] = Stage.getLogicalSize (s)
    const [vw, vh] = Stage.getVirtualSize (s)
    const vs       = Stage.getVirtualScale(s)

    h.resetTransform()
    h.fillStyle = s.__configureLogicalBackground__
    h.fillRect(0, 0, lw, lh)

    g.resetTransform()
    g.fillStyle = s.__configureVirtualBackground__
    g.fillRect(0, 0, vw, vh)

    Scene.render(s.scene, {s, t, dt, lw, lh, vw, vh, vs, g})

    // render scene
    h.translate(
      lw / 2 - vw / 2 * vs,
      lh / 2 - vh / 2 * vs
    )
    h.scale(vs, vs)
    h.drawImage(s.virtualCanvasElement, 0, 0)
  },

  animate(s: Stage, t0: number, t1: number, t2: number) {
    const t  = (t2 - t0) / 1000;
    const dt = (t2 - t1) / 1000;

    Stage.poll(s)
    Stage.update(s, t, dt)
    Stage.render(s, t, dt)

    requestAnimationFrame(t3 => Stage.animate(s, t0, t2, t3))
  },

  
  __resize__(s: Stage) {
    Stage.emit(s, "stage:resize", Vector2.new(
      s.logicalCanvasElement.getBoundingClientRect().width,
      s.logicalCanvasElement.getBoundingClientRect().height
    ))
  },
  
  __onChange__(s: Stage, c: Scene | undefined) {
    Scene.detach(s.scene, s)
    s.scene = c
    Scene.attach(s.scene, s)
  },

  __onResize__(s: Stage, [w, h]: Vector2) {
    s.logicalCanvasElement.width  = w
    s.logicalCanvasElement.height = h

    s.virtualCanvasElement = new OffscreenCanvas(
      s.__configureWidth__  || s.logicalCanvasElement.width,
      s.__configureHeight__ || s.logicalCanvasElement.height
    )

    s.logicalCanvasContext = s.logicalCanvasElement.getContext("2d")!
    s.virtualCanvasContext = s.virtualCanvasElement.getContext("2d")!

    // image smoothing
    s.logicalCanvasContext.imageSmoothingEnabled = !!s.__configureImageSmoothing__
    s.virtualCanvasContext.imageSmoothingEnabled = !!s.__configureImageSmoothing__
    if (s.__configureImageSmoothing__) {
      s.logicalCanvasContext.imageSmoothingQuality = s.__configureImageSmoothing__
      s.virtualCanvasContext.imageSmoothingQuality = s.__configureImageSmoothing__
    }

    // scale increment
    s.virtualScale = Math.min(
      s.logicalCanvasElement.width  / s.virtualCanvasElement.width,
      s.logicalCanvasElement.height / s.virtualCanvasElement.height
    )
    if (!!s.__configureScaleIncrement__)
      s.virtualScale = Math.max(s.__configureScaleIncrement__, Math.floor(s.virtualScale / s.__configureScaleIncrement__) * s.__configureScaleIncrement__)
  },

  get __canvas__() {
    const c = document.createElement("canvas")
    c.style.position = "absolute"
    c.style.top      = "0"
    c.style.left     = "0"
    c.style.width    = "100dvw"
    c.style.height   = "100dvh"
    document.body.appendChild(c)
    
    //@ts-ignore
    delete Stage.__canvas__
    //@ts-ignore
    return Stage.__canvas__ = c
  }
}