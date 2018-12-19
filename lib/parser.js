'use strict'

const parseFn = require('../build/pegjs-parser').parse

class Parser {
  sqlToAst(sql) {
    const astInfo = this.parse(sql)
    return astInfo && astInfo.ast
  }

  parse(sql) {
    return parseFn(sql)
  }

  tableList(sql) {
    const astInfo = this.parse(sql)
    return astInfo && astInfo.tableList
  }
}

module.exports = Parser
