import { Channel } from './channel'
import { Morse } from './morse'
import { Stage } from './stage'
import { Version, VERSION } from './version'

document.title = Version.toString(VERSION)




const stage = Stage.new({w: 512, h: 512})
const morse = Morse.new()

let wBuffer = ""

Channel.on<string>(morse.events, "morse:word", w => {
  wBuffer += w + " "
})

Stage.cue(stage, {
  onUpdate() {
    Morse.poll(morse)
  },

  onRender({g}) {
    g.fillStyle = "#000"
    g.font = "32px monospace"

    g.fillText(morse.seqBuffer, 100, 100)
    g.fillText(morse.chaBuffer, 100, 200)
    g.fillText(wBuffer, 100, 300)
  }
})


