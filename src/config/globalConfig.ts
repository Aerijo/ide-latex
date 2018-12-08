export class GlobalConfig {

  numMagicLines: number // number of lines to check for magic comments
  implicitRoot: boolean // if root cannot be detect for file, decide if we treat it as a root or not

  constructor () {
    console.log("Making global config")

    this.numMagicLines = 50
    this.implicitRoot = false
  }
}
