import { Channel } from "./channel"

export type Morse = {
  readonly key: string[]
  seqBuffer: string
  chaBuffer: string

  lastKey ?: KeyboardEvent,
  timeout ?: number,

  readonly minimumInterval: number
  readonly maximumInterval: number

  readonly events: Channel
}

export const Morse = {

  // because the american and international encoding use a different 
  // number of dits per dah, the following encoding schema unifies them by
  // representing a key down as a high signal "-" and a key up as a low signal "_"

  new(o ?: {
    key      ?: string[],
    dit      ?: string[],
    dah      ?: string[],
    wpmin    ?: number,
    wpmax    ?: number,
  }): Morse {
    // https://morsecode.world/international/timing/
    const minimumInterval = 1200 / (o?.wpmax ?? 22)
    const maximumInterval = 1200 / (o?.wpmin ??  8)
    // For ITU  maxInterval / minInterval < 3

    const morse: Morse = {
      key      : o?.key ?? [ " " ],
      seqBuffer: "",
      chaBuffer: "",
      minimumInterval,
      maximumInterval,
      events: Channel.new(),
    }

    console.log(minimumInterval, maximumInterval)

    window.onkeyup   = ke => {
      if (morse.key.includes(ke.key)) {
        Channel.emit(morse.events, "morse:keyup"  , ke)

        clearTimeout(morse.timeout)
        morse.timeout = setTimeout(
          () => Channel.emit(morse.events, "morse:i7", "   "), 
          7 * maximumInterval
        )
      }
    }

    window.onkeydown = ke => {
      if (morse.key.includes(ke.key)) {
        Channel.emit(morse.events, "morse:keydown", ke)

        clearTimeout(morse.timeout)
        morse.timeout = setTimeout(
          () => Channel.emit(morse.events, "morse:i7", "   "), 
          7 * maximumInterval
        )
      }
    }


    Channel.on<KeyboardEvent>(morse.events, "morse:keyup"  , ke => {
      if (morse.lastKey === undefined) {
        morse.lastKey = ke
        return
      }

      // key was down
      if (morse.lastKey?.type === "keydown") {
        const interval = ke.timeStamp - morse.lastKey.timeStamp
        if (
          interval >= 3 * morse.minimumInterval
        ) Channel.emit(morse.events, "morse:h3", "-"  )
        else if (
          interval >= 1 * morse.minimumInterval
        ) Channel.emit(morse.events, "morse:h1", "•"  )

        morse.lastKey = ke
      }
    })

    Channel.on<KeyboardEvent>(morse.events, "morse:keydown", ke => {
      if (morse.lastKey === undefined) {
        morse.lastKey = ke
        return
      }

      // key was up
      if (morse.lastKey?.type === "keyup") {
        const interval = ke.timeStamp - morse.lastKey.timeStamp

        if (
          interval >= 7 * morse.maximumInterval
        ) Channel.emit(morse.events, "morse:i7", "   ")
        else if (
          interval >= 3 * morse.maximumInterval
        ) Channel.emit(morse.events, "morse:i3", " "  )
        else 
          Channel.emit(morse.events, "morse:i1", ""   )

        morse.lastKey = ke
      }
    })

    Channel.on<string>(morse.events, "morse:h3", c => {
      morse.seqBuffer += c
    })

    Channel.on<string>(morse.events, "morse:h1", c => {
      morse.seqBuffer += c
    })

    Channel.on<string>(morse.events, "morse:i1", c => {
      morse.seqBuffer += c
    })

    Channel.on<string>(morse.events, "morse:i3", _ => {
      // morse.seqBuffer += c

      // @ts-ignore
      const char = Encoding.ITU[morse.seqBuffer]
      if (char) {
        morse.chaBuffer += char
        Channel.emit(morse.events, "morse:char", char)
      }

      morse.seqBuffer = ""
    })

    Channel.on<string>(morse.events, "morse:i7", _ => {

      // @ts-ignore
      const char = Encoding.ITU[morse.seqBuffer]
      if (char) {
        morse.chaBuffer += char
        Channel.emit(morse.events, "morse:char", char)
      }

      Channel.emit(morse.events, "morse:word", morse.chaBuffer)
      
      morse.seqBuffer = ""
      morse.chaBuffer = ""
    })

    return morse
  },

  poll(morse: Morse) {
    Channel.poll(morse.events)
  },
}

export const Encoding = {
  "ITU": {
    "•-"     : "A" as const,
    "-•••"   : "B" as const,
    "-•-•"   : "C" as const,
    "-••"    : "D" as const,
    "•"      : "E" as const,
    "••-•"   : "F" as const,
    "--•"    : "G" as const,
    "••••"   : "H" as const,
    "••"     : "I" as const,
    "•---"   : "J" as const,
    "-•-"    : "K" as const,
    "•-••"   : "L" as const,
    "--"     : "M" as const,
    "-•"     : "N" as const,
    "---"    : "O" as const,
    "•--•"   : "P" as const,
    "--•-"   : "Q" as const,
    "•-•"    : "R" as const,
    "•••"    : "S" as const,
    "-"      : "T" as const,
    "••-"    : "U" as const,
    "•••-"   : "V" as const,
    "•--"    : "W" as const,
    "-••-"   : "X" as const,
    "-•--"   : "Y" as const,
    "--••"   : "Z" as const,
    "•----"  : "1" as const,
    "••---"  : "2" as const,
    "•••--"  : "3" as const,
    "••••-"  : "4" as const,
    "•••••"  : "5" as const,
    "-••••"  : "6" as const,
    "--•••"  : "7" as const,
    "---••"  : "8" as const,
    "----•"  : "9" as const,
    "-----"  : "0" as const,
  }
}