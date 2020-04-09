const Parser = require('./lib/parser').default
const util = require('./lib/util')

module.exports = {
  Parser,
  util,
}

if (global && global.window) {
  global.window.NodeSQLParser = {
    Parser,
    util,
  }
}
