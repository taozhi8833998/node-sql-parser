const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('MariaDB Command SQL', () => {
  const parser = new Parser();

  function getParsedSql(sql, opt) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  describe('unknow database', () => {
    const sql = 'select id from db.abc'
    const opt = { database: 'unknowDB' }
    expect(parser.parse.bind(parser, sql, opt)).to.throw(`${opt.database} is not supported currently`)
  })

  describe('different quota based on database', () => {
    const sql = 'select id from db.abc'
    it('support pg to double quote', () => {
      expect(getParsedSql(sql, { database: 'PostgresQL'})).to.equal('SELECT "id" FROM "db"."abc"')
    })

    it('support mariadb quote', () => {
      expect(getParsedSql(sql, { database: 'MariaDB'})).to.equal('SELECT `id` FROM `db`.`abc`')
    })

  })
})
