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

  whiteListCheck(sql, whiteList) {
    if (!whiteList || whiteList.length === 0) return
    const tableAuthorityList = this.tableList(sql)
    let hasAuthority = true
    let denyTable = ''
    for (const tableAuthority of tableAuthorityList) {
      let hasTableAuthority = false
      for (const whiteAuthority of whiteList) {
        const regex = new RegExp(whiteAuthority)
        if (regex.test(tableAuthority)) {
          hasTableAuthority = true
          break
        }
      }
      if (!hasTableAuthority) {
        denyTable = tableAuthority
        hasAuthority = false
        break
      }
    }
    if (!hasAuthority) throw new Error(`SQL = '${sql}' is operating data on table with authority = '${denyTable}' that do not exist in whiteList`)
  }

  tableList(sql) {
    const astInfo = this.parse(sql)
    return astInfo && astInfo.tableList
  }
}

module.exports = Parser
