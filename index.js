const Parser = require('./lib/parser').default
const util = require('./lib/util')

module.exports = {
  Parser,
  util,
}

global.window.NodeSQLParser = {
  Parser,
  util,
}
