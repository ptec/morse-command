import { Stage } from './stage'
import { Version, VERSION } from './version'

document.title = Version.toString(VERSION)




const stage = Stage.new({w: 512, h: 512, si: 1})


Stage.cue(stage, {
  onRender({g}) {
    g.fillStyle = "#f00"
    g.fillRect(0, 0, 32, 32)
  }
})
