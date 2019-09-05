import { parse as parseFn } from '../build/pegjs-parser'
import astToSQL from './sql'

class Parser {
  astify(sql) {
    const astInfo = this.parse(sql)
    return astInfo && astInfo.ast
  }

  sqlify(ast) {
    return astToSQL(ast)
  }

  parse(sql) {
    return parseFn(sql)
  }

  whiteListCheck(sql, whiteList, type = 'table') {
    if (!whiteList || whiteList.length === 0) return
    if (!this[`${type}List`] || typeof this[`${type}List`] !== 'function') throw new Error(`${type} is not valid check mode`)
    const checkFun = this[`${type}List`].bind(this)
    const authorityList = checkFun(sql)
    let hasAuthority = true
    let denyInfo = ''
    for (const authority of authorityList) {
      let hasCorrespondingAuthority = false
      for (const whiteAuthority of whiteList) {
        const regex = new RegExp(whiteAuthority, 'i')
        if (regex.test(authority)) {
          hasCorrespondingAuthority = true
          break
        }
      }
      if (!hasCorrespondingAuthority) {
        denyInfo = authority
        hasAuthority = false
        break
      }
    }
    if (!hasAuthority) throw new Error(`authority = '${denyInfo}' is required in ${type} whiteList to execute SQL = '${sql}'`)
  }

  tableList(sql) {
    const astInfo = this.parse(sql)
    return astInfo && astInfo.tableList
  }

  columnList(sql) {
    const astInfo = this.parse(sql)
    return astInfo && astInfo.columnList
  }
}

export default Parser
