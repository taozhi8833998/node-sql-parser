const { expect } = require('chai')
const { tableHintToSQL } = require('../src/tables')
const Parser = require('../src/parser').default

describe('transactsql', () => {
  const parser = new Parser();
  const tsqlOpt = { database: 'transactsql' }

  function getParsedSql(sql, opt = tsqlOpt) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('should support select top n', () => {
    const sql = 'select top 3 * from tableA'
    expect(getParsedSql(sql)).to.equal('SELECT TOP 3 * FROM [tableA]')
  })

  it('should support select top n percent', () => {
    let sql = 'select top 3 percent * from tableA'
    expect(getParsedSql(sql)).to.equal('SELECT TOP 3 PERCENT * FROM [tableA]')
    sql = 'SELECT TOP (10) PERCENT * FROM myTable'
    expect(getParsedSql(sql)).to.equal('SELECT TOP (10) PERCENT * FROM [myTable]')
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

  it('should support nested block comments', () => {
    const sql = "select col /* /* */ /* */ */ FROM tbl"
    expect(getParsedSql(sql)).to.equal('SELECT [col] FROM [tbl]')
  })

  it('should properly escape column aliases that contain special characters', () => {
    const sql = `select column_name as [Column Name] from table_name`
    expect(getParsedSql(sql)).to.equal('SELECT [column_name] AS [Column Name] FROM [table_name]')
  })

  it('should support exec stmt', () => {
    const sql = `EXEC msdb.dbo.sp_delete_database_backuphistory @database_name = N'Test'
    GO`
    expect(getParsedSql(sql)).to.equal("EXEC [msdb].[dbo].[sp_delete_database_backuphistory] @database_name = N'Test' GO")
  })

  it('should support over in aggregation function', () => {
    let sql = `select sum(order_rate) over(
      order by quarter_time
      rows between 4 preceding and 1 preceding -- window frame
    ) as new_sum from t
    `
    expect(getParsedSql(sql)).to.equal("SELECT SUM([order_rate]) OVER (ORDER BY [quarter_time] ASC ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING) AS [new_sum] FROM [t]")
    sql = 'SELECT syscolumns.name, ROW_NUMBER() OVER(PARTITION BY id ORDER BY colid) rowNo from sysColumns'
    expect(getParsedSql(sql)).to.equal("SELECT [syscolumns].[name], ROW_NUMBER() OVER (PARTITION BY [id] ORDER BY [colid] ASC) AS [rowNo] FROM [sysColumns]")
  })

  it('should support status as column or table name, left and right as function name', () => {
    let sql = 'select * from status where 1=1'
    expect(getParsedSql(sql)).to.equal("SELECT * FROM [status] WHERE 1 = 1")
    sql = 'select status from test where 1=1'
    expect(getParsedSql(sql)).to.equal("SELECT [status] FROM [test] WHERE 1 = 1")
    sql = "select LEFT('test',2) ,RIGHT('test', 2) from [test]"
    expect(getParsedSql(sql)).to.equal("SELECT LEFT('test', 2), RIGHT('test', 2) FROM [test]")
  })

  it('should support distinct without parentheses', () => {
    const sql = 'select count(DISTINCT ISNULL([email],-1)) from demo'
    expect(getParsedSql(sql)).to.equal("SELECT COUNT(DISTINCT ISNULL([email], -1)) FROM [demo]")
  })

  it('should support drop table if exists', () => {
    const sql = 'DROP TABLE IF EXISTS event_log'
    expect(getParsedSql(sql)).to.equal("DROP TABLE IF EXISTS [event_log]")
  })

  it('should support left join', () => {
    const sql = `select
    trpriv_seq, trpriv_titulo, trpriv_id, trprivc_data
    from termos_privacidade
    left join termos_privacidade_versoes on (trprivv_trpriv_id = trpriv_id and trprivv_unidg_id is null and trprivv_inicio <= '2022-08-16T15:00:04.832Z' and (trprivv_fim >= '2022-08-16T15:00:04.832Z' or trprivv_fim is null))
    left join termos_privacidade_consentimentos on (trprivc_trprivv_id = trprivv_id and trpriv_individual = 0 and trprivc_pes_id = 'null')
    where 1 = 1 AND trprivv_id is not null   AND 1 = 2
    order by 1,2`

    const ast = parser.astify(sql, tsqlOpt)
    expect(ast.from[1].join).to.equal('LEFT JOIN')
    expect(parser.sqlify(ast, tsqlOpt)).to.equal("SELECT [trpriv_seq], [trpriv_titulo], [trpriv_id], [trprivc_data] FROM [termos_privacidade] LEFT JOIN [termos_privacidade_versoes] ON ([trprivv_trpriv_id] = [trpriv_id] AND [trprivv_unidg_id] IS NULL AND [trprivv_inicio] <= '2022-08-16T15:00:04.832Z' AND ([trprivv_fim] >= '2022-08-16T15:00:04.832Z' OR [trprivv_fim] IS NULL)) LEFT JOIN [termos_privacidade_consentimentos] ON ([trprivc_trprivv_id] = [trprivv_id] AND [trpriv_individual] = 0 AND [trprivc_pes_id] = 'null') WHERE 1 = 1 AND [trprivv_id] IS NOT NULL AND 1 = 2 ORDER BY 1 ASC, 2 ASC")
  })

  it('should support table schema', () => {
    const sql = `INSERT INTO source.dbo.movie (genre_id, title, release_date)
    VALUES (@param1, @param2, @param3), (@param1, @param2, @param3);`
    expect(getParsedSql(sql)).to.equal("INSERT INTO [source].[dbo].[movie] ([genre_id], [title], [release_date]) VALUES (@param1,@param2,@param3), (@param1,@param2,@param3)")
  })

  it('should support with clause', () => {
    const sql = `WITH mycte (a, b, c) AS
    (SELECT DISTINCT z.a, z.b, z.c FROM mytable)
  SELECT a from mycte`
    expect(getParsedSql(sql)).to.equal("WITH [mycte]([a], [b], [c]) AS (SELECT DISTINCT [z].[a], [z].[b], [z].[c] FROM [mytable]) SELECT [a] FROM [mycte]")
  })

  describe('table hint', () => {
    it('should support table hint', () => {
      let sql = "SELECT title FROM dbo.movie WITH (nolock) WHERE release_date >= '01/01/2021';"
      expect(getParsedSql(sql)).to.equal("SELECT [title] FROM [dbo].[movie] WITH (NOLOCK) WHERE [release_date] >= '01/01/2021'")
      sql = "select title FROM dbo.MyTable WITH (FORCESEEK (MyIndex (col1, col2, col3))) WHERE [release_date] >= '01/01/2021'"
      expect(getParsedSql(sql)).to.equal("SELECT [title] FROM [dbo].[MyTable] WITH (FORCESEEK ([MyIndex] ([col1], [col2], [col3]))) WHERE [release_date] >= '01/01/2021'")
      sql = "select title FROM dbo.MyTable WITH (NOEXPAND INDEX (MyIndex, MyIndex2)) WHERE [release_date] >= '01/01/2021'"
      expect(getParsedSql(sql)).to.equal("SELECT [title] FROM [dbo].[MyTable] WITH (NOEXPAND INDEX ([MyIndex], [MyIndex2])) WHERE [release_date] >= '01/01/2021'")
      sql = "select title FROM dbo.MyTable WITH (INDEX = MyIndex) WHERE [release_date] >= '01/01/2021'"
      expect(getParsedSql(sql)).to.equal("SELECT [title] FROM [dbo].[MyTable] WITH (INDEX = [MyIndex]) WHERE [release_date] >= '01/01/2021'")
      sql = "select title FROM dbo.MyTable WITH (spatial_window_max_cells = 12) WHERE [release_date] >= '01/01/2021'"
      expect(getParsedSql(sql)).to.equal("SELECT [title] FROM [dbo].[MyTable] WITH (SPATIAL_WINDOW_MAX_CELLS = 12) WHERE [release_date] >= '01/01/2021'")
      expect(tableHintToSQL()).to.be.undefined
    })
  })

  it('should support type as column name', () => {
    const sql = `ALTER TABLE test ADD
    [type] varchar(255) NOT NULL DEFAULT ('default');`
    expect(getParsedSql(sql)).to.equal("ALTER TABLE [test] ADD [type] VARCHAR(255) NOT NULL DEFAULT ('default')")
  })

  it('should support create table', () => {
    const sql = `CREATE TABLE [test] (
      [id] [bigint] IDENTITY(1,1) NOT NULL,
      [session_id] [int] NOT NULL,
    PRIMARY KEY CLUSTERED
    (
      [id] ASC
    ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) on [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]`
    expect(getParsedSql(sql)).to.equal(`CREATE TABLE [test] ([id] BIGINT NOT NULL IDENTITY(1, 1), [session_id] INT NOT NULL, PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]`)
  })

  it('should support pviot and unpviot clause', () => {
    let sql = `SELECT VendorID, [250] AS Emp1, [251] AS Emp2, [256] AS Emp3, [257] AS Emp4, [260] AS Emp5
    FROM
    (SELECT PurchaseOrderID, EmployeeID, VendorID  FROM Purchasing.PurchaseOrderHeader) p
    PIVOT  (  COUNT (PurchaseOrderID)  FOR EmployeeID IN  ( [250], [251], [256], [257], [260] )  ) AS pvt
    ORDER BY pvt.VendorID `
    expect(getParsedSql(sql)).to.be.equal('SELECT [VendorID], [250] AS [Emp1], [251] AS [Emp2], [256] AS [Emp3], [257] AS [Emp4], [260] AS [Emp5] FROM (SELECT [PurchaseOrderID], [EmployeeID], [VendorID] FROM [Purchasing].[PurchaseOrderHeader]) AS [p] PIVOT(COUNT([PurchaseOrderID]) FOR [EmployeeID] IN ([250], [251], [256], [257], [260])) AS [pvt] ORDER BY [pvt].[VendorID] ASC')
    sql =  `SELECT VendorID, [250] AS Emp1, [251] AS Emp2, [256] AS Emp3, [257] AS Emp4, [260] AS Emp5
    FROM
    (SELECT PurchaseOrderID, EmployeeID, VendorID  FROM Purchasing.PurchaseOrderHeader) p
    UNPIVOT  ( pvt.VendorID FOR EmployeeID IN  ( [250], [251], [256], [257], [260] )  ) AS pvt
    ORDER BY pvt.VendorID `
    expect(getParsedSql(sql)).to.be.equal('SELECT [VendorID], [250] AS [Emp1], [251] AS [Emp2], [256] AS [Emp3], [257] AS [Emp4], [260] AS [Emp5] FROM (SELECT [PurchaseOrderID], [EmployeeID], [VendorID] FROM [Purchasing].[PurchaseOrderHeader]) AS [p] UNPIVOT([pvt].[VendorID] FOR [EmployeeID] IN ([250], [251], [256], [257], [260])) AS [pvt] ORDER BY [pvt].[VendorID] ASC')
  })

  it('should support with clause before update stmt', () => {
    const sql = `WITH rank_update AS (
      SELECT
          [rank],
          ROW_NUMBER() OVER (
              PARTITION BY class_id
              ORDER BY section_id, [rank] ASC, [segment_id], [id]
          ) AS row_rank
      FROM
          [class_segment_class]
      WHERE
          [section_id] IS NOT NULL
    )
    UPDATE [rank_update]
    SET [rank] = [row_rank];`
    expect(getParsedSql(sql)).to.be.equal('WITH [rank_update] AS (SELECT [rank], ROW_NUMBER() OVER (PARTITION BY [class_id] ORDER BY [section_id] ASC, [rank] ASC, [segment_id] ASC, [id] ASC) AS [row_rank] FROM [class_segment_class] WHERE [section_id] IS NOT NULL) UPDATE [rank_update] SET [rank] = [row_rank]')
  })
  it('should support alter view', () => {
    let sql = `ALTER VIEW [dbo].[reporting_class]
    AS
    SELECT
      [ClassHexID],
      [DepartmentID] AS class_source
    FROM [Class]
    WHERE [Class].[active] = 1`
    expect(getParsedSql(sql)).to.be.equal('ALTER VIEW [dbo].[reporting_class] AS SELECT [ClassHexID], [DepartmentID] AS [class_source] FROM [Class] WHERE [Class].[active] = 1')
    sql = 'ALTER VIEW [dbo].[reporting_class] (id, active) with ENCRYPTION, SCHEMABINDING AS SELECT [ClassHexID], [DepartmentID] AS class_source FROM [Class] WHERE [Class].[active] = 1 with check option'
    expect(getParsedSql(sql)).to.be.equal('ALTER VIEW [dbo].[reporting_class] ([id], [active]) WITH ENCRYPTION, SCHEMABINDING AS SELECT [ClassHexID], [DepartmentID] AS [class_source] FROM [Class] WHERE [Class].[active] = 1 WITH CHECK OPTION')
  })
})
