const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('transactsql', () => {
  const parser = new Parser();

  function getParsedSql(sql, opt = { database: 'transactsql' }) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('should support select top n', () => {
    const sql = 'select top 3 * from tableA'
    expect(getParsedSql(sql)).to.equal('SELECT TOP 3 * FROM [tableA]')
  })

  it('should support select top n percent', () => {
    const sql = 'select top 3 percent * from tableA'
    expect(getParsedSql(sql)).to.equal('SELECT TOP 3 PERCENT * FROM [tableA]')
  })

  it('should support select count', () => {
    let sql = 'select count(*);'
    expect(getParsedSql(sql)).to.equal('SELECT COUNT(*)')
    sql = 'SELECT COUNT(DISTINCT foo);'
    expect(getParsedSql(sql)).to.equal('SELECT COUNT(DISTINCT [foo])')
    sql = 'SELECT COUNT(*) as foo;'
    expect(getParsedSql(sql)).to.equal('SELECT COUNT(*) AS [foo]')
  })

  it('should support comment before', () => {
    const sql = `-- +migrate Up
    CREATE TABLE test (
      id BIGINT NOT NULL PRIMARY KEY IDENTITY(1, 1)
    );`
    expect(getParsedSql(sql)).to.equal('CREATE TABLE [test] ([id] BIGINT NOT NULL IDENTITY(1, 1) PRIMARY KEY)')
  })

  it('should properly escape column aliases that contain special characters', () => {
    const sql = `select column_name as [Column Name] from table_name`
    expect(getParsedSql(sql)).to.equal('SELECT [column_name] AS [Column Name] FROM [table_name]')
  })

  it('should support exec stmt', () => {
    const sql = `EXEC msdb.dbo.sp_delete_database_backuphistory @database_name = N'Test'
    GO`
    expect(getParsedSql(sql)).to.equal("EXEC [msdb.dbo].[sp_delete_database_backuphistory] @database_name = N'Test' GO")
  })

  it('should support over in aggregation function', () => {
    const sql = `select sum(order_rate) over(
      order by quarter_time
      rows between 4 preceding and 1 preceding -- window frame
    ) as new_sum from t
    `
    expect(getParsedSql(sql)).to.equal("SELECT SUM([order_rate]) OVER (ORDER BY [quarter_time] ASC ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING) AS [new_sum] FROM [t]")
  })

  it('should support status as column or table name', () => {
    let sql = 'select * from status where 1=1'
    expect(getParsedSql(sql)).to.equal("SELECT * FROM [status] WHERE 1 = 1")
    sql = 'select status from test where 1=1'
    expect(getParsedSql(sql)).to.equal("SELECT [status] FROM [test] WHERE 1 = 1")
  })

})
