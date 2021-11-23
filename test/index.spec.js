const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('MariaDB Command SQL', () => {
  const parser = new Parser();

  function getParsedSql(sql, opt) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('unknow database', () => {
    const sql = 'select id from db.abc'
    const opt = { database: 'unknownDB' }
    expect(parser.parse.bind(parser, sql, opt)).to.throw(`${opt.database} is not supported currently`)
  })

  describe('blank line or whitespace auto remove', () => {
    const sql = `

    CALL utility.create_backup_script(schemaName, 'table_name', 'ticket_name');

    DELETE FROM table_name WHERE id = 0;

    `

    it('should support blank line', () => {
      const ast = parser.parse(sql)
      expect(ast.ast.length).to.be.equal(2)
    })
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
