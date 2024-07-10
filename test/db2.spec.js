const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('db2', () => {
  const parser = new Parser();
  const DEFAULT_OPT =  { database: 'db2' }

  function getParsedSql(sql, opt = DEFAULT_OPT) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('should support basic db2', () => {
    let sql = 'SELECT  id as test FROM customers'
    expect(getParsedSql(sql)).to.be.equal('SELECT id AS test FROM customers')
  })
})