export type Version = {
  readonly moniker: string,
  readonly major  : number,
  readonly minor  : number,
  readonly patch  : number,
}

export const Version = {
  new(
    moniker: string,
    major  : number,
    minor  : number,
    patch  : number
  ): Version {
    return {
      moniker,
      major  ,
      minor  ,
      patch  ,
    }
  },

  toString(a: Version) {
    return `${a.moniker} ${a.major}.${a.minor}.${a.patch}`
  }
}

export const VERSION = Version.new("Morse Command", 0, 0, 1)