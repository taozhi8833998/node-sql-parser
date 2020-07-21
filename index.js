import Parser from './src/parser'
import * as util from './src/util'

export {
  Parser,
  util,
}

if (global && global.window) {
  global.window.NodeSQLParser = {
    Parser,
    util,
  }
}
