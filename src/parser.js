import { parse as mysql } from '../build/mysql'
import { parse as mariadb } from '../build/mariadb'
import astToSQL from './sql'

const parser = {
  mysql,
  mariadb,
}
class Parser {
  astify(sql, opt) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.ast
  }

  sqlify(ast, opt) {
    return astToSQL(ast, opt)
  }

  parse(sql, { database = 'mysql' } = {}) {
    const typeCase = database.toLowerCase()
    if (parser[typeCase]) return parser[typeCase](sql)
    throw new Error(`${database} is not supported currently`)
  }

  whiteListCheck(sql, whiteList, opt = {}) {
    if (!whiteList || whiteList.length === 0) return
    const { type = 'table' } = opt
    if (!this[`${type}List`] || typeof this[`${type}List`] !== 'function') throw new Error(`${type} is not valid check mode`)
    const checkFun = this[`${type}List`].bind(this)
    const authorityList = checkFun(sql, opt)
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

  tableList(sql, opt) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.tableList
  }

  columnList(sql, opt) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.columnList
  }
}

export default Parser
