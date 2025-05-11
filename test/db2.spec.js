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
    sql = 'SELECT * FROM "FGVST2"."CONTACT_TABLE25" FETCH FIRST 10 ROWS ONLY'
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM FGVST2.CONTACT_TABLE25 FETCH FIRST 10 ROWS ONLY')
  })
  
  SQL_LIST = [
    {
      title: 'except multiple select stmt',
      sql: [
        `SELECT CUSTOMER_NUMBER FROM "ORG"."CUSTOMER_INFO_1"
        EXCEPT
        SELECT CUSTOMER_NUMBER FROM "ORG"."CUSTOMER_BACKUP";`,
        'SELECT CUSTOMER_NUMBER FROM ORG.CUSTOMER_INFO_1 EXCEPT SELECT CUSTOMER_NUMBER FROM ORG.CUSTOMER_BACKUP'
      ]
    },
    {
      title: 'isolation clause',
      sql: [
        'SELECT * FROM STAFF WITH UR',
        'SELECT * FROM STAFF WITH UR'
      ]
    },
    {
      title: 'fetch first row',
      sql: [
        'SELECT * FROM my_table FETCH FIRST 1 ROW ONLY;',
        'SELECT * FROM my_table FETCH FIRST 1 ROW ONLY'
      ]
    },
    {
      title: 'fetch last rows',
      sql: [
        'SELECT * FROM my_table FETCH LAST 10 ROWS ONLY;',
        'SELECT * FROM my_table FETCH LAST 10 ROWS ONLY'
      ]
    },
    {
      title: 'fetch next row',
      sql: [
        'SELECT * FROM my_table FETCH NEXT 10 ROWS ONLY;',
        'SELECT * FROM my_table FETCH NEXT 10 ROWS ONLY'
      ]
    },
    {
      title: 'OFFSET rows',
      sql: [
        'SELECT * FROM my_table OFFSET 10 ROWS',
        'SELECT * FROM my_table OFFSET 10 ROWS'
      ]
    },
    {
      title: 'OFFSET number of rows',
      sql: [
        'SELECT * FROM my_table OFFSET 10',
        'SELECT * FROM my_table OFFSET 10'
      ]
    },
  ]
  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0])).to.equal(sql[1])
    })
  })
})