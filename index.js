import Parser from './src/parser'
import * as util from './src/util'

export {
  Parser,
  util,
}

// for web worker
if (typeof self === "object" && self) {
  self.NodeSQLParser = {
    Parser,
    util,
  }
}

if (typeof global === "undefined" && typeof window === "object" && window) window.global = window

if (typeof global === "object" && global && global.window) {
  global.window.NodeSQLParser = {
    Parser,
    util,
  }
}
