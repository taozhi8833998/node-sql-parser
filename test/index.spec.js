const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('MariaDB Command SQL', () => {
  const parser = new Parser();
  const opt = { database: 'unknowDB' }

  function getParsedSql(sql) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  describe('unknow database', () => {
    const sql = 'select * from abc'
    expect(parser.parse.bind(parser, sql, opt)).to.throw(`${opt.database} is not supported currently`)
  })
})
