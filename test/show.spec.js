const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('SHOW COMMAND', () => {
  const parser = new Parser();

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  it('should parse show logs', () => {
    ['BINARY', 'MASTER'].forEach(type => {
      const sql = `SHOW ${type} LOGS`
      expect(getParsedSql(sql)).to.be.equal(sql)
    })
  })

  it('should parse binlog events', () => {
    const prefix = 'SHOW BINLOG EVENTS'
    expect(getParsedSql(prefix)).to.be.equal(prefix)
    let sql = `${prefix} in 'abc'`
    expect(getParsedSql(sql)).to.be.equal(`${prefix} IN 'abc'`)
    sql = `${prefix} in 'abc' from def`
    expect(getParsedSql(sql)).to.be.equal(`${prefix} IN 'abc' FROM \`def\``)
    sql = `${prefix} in 'abc' from def limit 0,10`
    expect(getParsedSql(sql)).to.be.equal(`${prefix} IN 'abc' FROM \`def\` LIMIT 0, 10`)
    sql = `${prefix} from def limit 0,10`
    expect(getParsedSql(sql)).to.be.equal(`${prefix} FROM \`def\` LIMIT 0, 10`)
  });

  ['CHARACTER SET', 'COLLATION'].forEach(type => {
    it(`should parse show ${type.toLowerCase()}`, () => {
      const prefix = `SHOW ${type}`
      expect(getParsedSql(prefix)).to.be.equal(prefix)
      let sql = `${prefix} like 'latin%'`
      expect(getParsedSql(sql)).to.be.equal(`${prefix} LIKE 'latin%'`)
      sql = `${prefix} where Charset = 'latin1' `
      expect(getParsedSql(sql)).to.be.equal(`${prefix} WHERE \`Charset\` = 'latin1'`)
    })
  })

  it('show grants for user', () => {
    const prefix = 'SHOW GRANTS'
    expect(getParsedSql(prefix)).to.be.equal(prefix)
    let sql = `${prefix} for 'u1'@'localhost'`
    expect(getParsedSql(sql)).to.be.equal(`${prefix} FOR 'u1'@'localhost'`)
    sql = `${prefix} for 'u1'@'localhost' using 'r1', 'r2'`
    expect(getParsedSql(sql)).to.be.equal(`${prefix} FOR 'u1'@'localhost' USING 'r1', 'r2'`)
    sql = `${prefix} for u1 using 'r1'`
    expect(getParsedSql(sql)).to.be.equal(`${prefix} FOR 'u1' USING 'r1'`)
  })
})