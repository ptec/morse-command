export type __On__   = { readonly is: "__on__"  , readonly when  : string, readonly then  : Handler<any> }
export type __Off__  = { readonly is: "__off__" , readonly when ?: string, readonly then ?: Handler<any> }
export type __Emit__ = { readonly is: "__emit__", readonly when  : string, readonly what  : any          }

export type Action = __On__ | __Off__ | __Emit__

export type Context<T> = {
  readonly from: Channel,
  readonly when: string,
  readonly self: Handler<T>,
}

export type Handler<T> = (t: T, c: Context<T>) => void

export type Channel = {
  handlers: Map<string, Set<Handler<any>>>,
  deferred: Array<Action>,
}

export const Channel = {

  new(): Channel {
    return {
      handlers: new Map(),
      deferred:        [],
    }
  },

  on  <T>(from: Channel, when  : string, then  : Handler<T>, defer=true) {
    const a: __On__  = { is: "__on__"  , when, then }
    if (defer) Channel.__queue__(from, a)
    else       Channel.__flush__(from, a)
  },

  off <T>(from: Channel, when ?: string, then ?: Handler<T>, defer=true) {
    const a: __Off__ = { is: "__off__" , when, then }
    if (defer) Channel.__queue__(from, a)
    else       Channel.__flush__(from, a)
  },

  emit<T>(from: Channel, when: string, what: T, defer=true) {
    const a: __Emit__ = { is: "__emit__", when, what }
    if (defer) Channel.__queue__(from, a)
    else       Channel.__flush__(from, a)
  },

  poll(from: Channel) {
    from.deferred.splice(0).forEach(
      a => Channel.__flush__(from, a)
    )
  },

  __queue__(from: Channel, a: Action) {
    from.deferred.push(a)
  },

  __flush__(from: Channel, a: Action) {
    switch (a.is) {
      case "__on__"  : Channel.__on__  (from, a); break
      case "__off__" : Channel.__off__ (from, a); break
      case "__emit__": Channel.__emit__(from, a); break
    }
  },

  __on__  (from: Channel, {when, then}: __On__  ) {
    Channel.__require__(from, when).add(then)
  },

  __off__ (from: Channel, {when, then}: __Off__ ) {
           if (when !== undefined && then !== undefined) {
      Channel.__request__(from, when)?.delete(then)
    } else if (when !== undefined && then === undefined) {
      Channel.__request__(from, when)?.clear()
    } else if (when === undefined && then !== undefined) {
      from.handlers.forEach((list, _) => {
        list.delete(then)
      })
    } else if (when === undefined && then === undefined) {
      from.handlers.clear()
    }
  },

  __emit__(from: Channel, {when, what}: __Emit__) {
    Channel.__request__(from, when)?.forEach(self => self(what, {from, when, self}))
  },

  __request__(from: Channel, when: string) {
    return from.handlers.get(when)
  },

  __require__(from: Channel, when: string) {
    let list = from.handlers.get(when)
    if (!list) from.handlers.set(when, 
      list = new Set()
    )
    return list
  },
}