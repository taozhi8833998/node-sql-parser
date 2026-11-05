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

  describe('declare global temporary table', () => {
    it('should support declare global temporary table with subquery and WITH DATA WITH REPLACE', () => {
      const sql = 'declare global temporary table soldoutitems as (select * from items where a = 0) with data with replace'
      expect(getParsedSql(sql)).to.be.equal('DECLARE GLOBAL TEMPORARY TABLE soldoutitems AS (SELECT * FROM items WHERE a = 0) WITH DATA WITH REPLACE')
    })

    it('should support declare global temporary table with column definitions', () => {
      const sql = 'declare global temporary table temp_table (col1 integer, col2 varchar(30))'
      expect(getParsedSql(sql)).to.be.equal('DECLARE GLOBAL TEMPORARY TABLE temp_table (col1 INTEGER, col2 VARCHAR(30))')
    })

    it('should support declare global temporary table with ON COMMIT PRESERVE ROWS', () => {
      const sql = 'declare global temporary table temp_table (col1 integer) on commit preserve rows'
      expect(getParsedSql(sql)).to.be.equal('DECLARE GLOBAL TEMPORARY TABLE temp_table (col1 INTEGER) ON COMMIT PRESERVE ROWS')
    })

    it('should support declare global temporary table with ON COMMIT DELETE ROWS', () => {
      const sql = 'declare global temporary table temp_table (col1 integer) on commit delete rows'
      expect(getParsedSql(sql)).to.be.equal('DECLARE GLOBAL TEMPORARY TABLE temp_table (col1 INTEGER) ON COMMIT DELETE ROWS')
    })

    it('should support declare global temporary table with NOT LOGGED', () => {
      const sql = 'declare global temporary table temp_table (col1 integer) not logged'
      expect(getParsedSql(sql)).to.be.equal('DECLARE GLOBAL TEMPORARY TABLE temp_table (col1 INTEGER) NOT LOGGED')
    })

    it('should support declare global temporary table with multiple options', () => {
      const sql = 'declare global temporary table temp_table (col1 integer) on commit preserve rows not logged with replace'
      expect(getParsedSql(sql)).to.be.equal('DECLARE GLOBAL TEMPORARY TABLE temp_table (col1 INTEGER) WITH REPLACE ON COMMIT PRESERVE ROWS NOT LOGGED')
    })

    it('should support declare global temporary table with DEFINITION ONLY', () => {
      const sql = 'declare global temporary table temp_table as (select * from items) definition only'
      expect(getParsedSql(sql)).to.be.equal('DECLARE GLOBAL TEMPORARY TABLE temp_table AS (SELECT * FROM items) DEFINITION ONLY')
    })

    it('should support declare global temporary table with schema prefix', () => {
      const sql = 'declare global temporary table "session".temp_table (col1 integer)'
      expect(getParsedSql(sql)).to.be.equal('DECLARE GLOBAL TEMPORARY TABLE session.temp_table (col1 INTEGER)')
    })
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