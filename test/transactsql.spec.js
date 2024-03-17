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
    sql = 'SELECT TOP 10 * FROM myTable;'
    expect(getParsedSql(sql)).to.equal('SELECT TOP 10 * FROM [myTable]')
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

  it('should support execute stmt without parameters', () => {
    const sql = `EXECUTE sys.sp_who`
    expect(getParsedSql(sql)).to.equal("EXECUTE [sys].[sp_who]")
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

  it('should support inner join without inner', () => {
    const sql = `WITH t1 AS
    (SELECT date_sold,
            amount_sold AS cake_sold
      FROM desserts
      WHERE product = 'Cake' ),
        t2 AS
      (SELECT date_sold,
              isnull(amount_sold, 0) AS pie_sold
      FROM desserts
      WHERE product = 'Pie' ),
        t3 AS
      (SELECT t1.date_sold,
              t1.cake_sold,
              t2.pie_sold
      FROM t1
      JOIN t2 ON t1.date_sold = t2.date_sold)
    SELECT date_sold,
          ABS(CAST(cake_sold AS BIGINT) - CAST(pie_sold AS BIGINT)) AS difference,
          CASE
              WHEN cake_sold > pie_sold THEN 'Cake'
              ELSE 'Pie'
          END AS sold_more
    FROM t3`
    expect(getParsedSql(sql)).to.equal("WITH [t1] AS (SELECT [date_sold], [amount_sold] AS [cake_sold] FROM [desserts] WHERE [product] = 'Cake'), [t2] AS (SELECT [date_sold], isnull([amount_sold], 0) AS [pie_sold] FROM [desserts] WHERE [product] = 'Pie'), [t3] AS (SELECT [t1].[date_sold], [t1].[cake_sold], [t2].[pie_sold] FROM [t1] JOIN [t2] ON [t1].[date_sold] = [t2].[date_sold]) SELECT [date_sold], ABS(CAST([cake_sold] AS BIGINT) - CAST([pie_sold] AS BIGINT)) AS [difference], CASE WHEN [cake_sold] > [pie_sold] THEN 'Cake' ELSE 'Pie' END AS [sold_more] FROM [t3]")
  })

  it('should support table schema', () => {
    let sql = `INSERT INTO source.dbo.movie (genre_id, title, release_date)
    VALUES (@param1, @param2, @param3), (@param1, @param2, @param3);`
    expect(getParsedSql(sql)).to.equal("INSERT INTO [source].[dbo].[movie] (genre_id, title, release_date) VALUES ([@param1],[@param2],[@param3]), ([@param1],[@param2],[@param3])")
    sql = `INSERT INTO server.db.owner.movie (genre_id, title, release_date)
    VALUES (@param1, @param2, @param3), (@param1, @param2, @param3);`
    expect(getParsedSql(sql)).to.equal("INSERT INTO [server].[db].[owner].[movie] (genre_id, title, release_date) VALUES ([@param1],[@param2],[@param3]), ([@param1],[@param2],[@param3])")
  })

  it('should support full-qualified form in column', () => {
    let sql = 'SELECT dbo.movie.id FROM dbo.movie'
    expect(getParsedSql(sql)).to.equal('SELECT [dbo].[movie].[id] FROM [dbo].[movie]')
    sql = 'SELECT source.dbo.movie.id FROM source.dbo.movie'
    expect(getParsedSql(sql)).to.equal('SELECT [source].[dbo].[movie].[id] FROM [source].[dbo].[movie]')
    sql = 'SELECT * FROM source.dbo.movie WHERE source.dbo.movie.genre_id = 1'
    expect(getParsedSql(sql)).to.equal('SELECT * FROM [source].[dbo].[movie] WHERE [source].[dbo].[movie].[genre_id] = 1')
    sql = 'SELECT TOP 1000 [production].[categories].[category_name], COUNT([production].[products].[product_id]) AS [product_count]\n' +
            'FROM [production].[products]\n' +
            'INNER JOIN [production].[categories] ON [production].[products].[category_id] = [production].[categories].[category_id]\n' +
            'GROUP BY [production].[categories].[category_name]'
    expect(getParsedSql(sql)).to.be.equal("SELECT TOP 1000 [production].[categories].[category_name], COUNT([production].[products].[product_id]) AS [product_count] FROM [production].[products] INNER JOIN [production].[categories] ON [production].[products].[category_id] = [production].[categories].[category_id] GROUP BY [production].[categories].[category_name]")
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
      sql = `SELECT
      '' AS InetSalePaymentBroker,
       null AS InetSalePaymentDate,
        '' AS SenderMersisNo,
      '' AS SenderIsletmeMerkezi,
      '' AS SenderTicaretSicilNo,
  NULL AS isExport,
      NULL AS IhracKayitKodu

      FROM LG_001_01_INVOICE INV
        LEFT OUTER JOIN LG_001_CLCARD AS CLIENT ON (CLIENT.LOGICALREF = INV.CLIENTREF)
      LEFT OUTER JOIN LG_001_01_STFICHE AS STFICHE (nolock)  ON (INV.FICHENO = STFICHE.INVNO)
        WHERE
        INV.TRCODE IN (3,6,7,8,9, 13)
        AND INV.DATE_ BETWEEN Convert(datetime,'',102) AND Convert(datetime,'',102)`
      expect(getParsedSql(sql)).to.equal("SELECT '' AS [InetSalePaymentBroker], NULL AS [InetSalePaymentDate], '' AS [SenderMersisNo], '' AS [SenderIsletmeMerkezi], '' AS [SenderTicaretSicilNo], NULL AS [isExport], NULL AS [IhracKayitKodu] FROM [LG_001_01_INVOICE] AS [INV] LEFT OUTER JOIN [LG_001_CLCARD] AS [CLIENT] ON ([CLIENT].[LOGICALREF] = [INV].[CLIENTREF]) LEFT OUTER JOIN [LG_001_01_STFICHE] AS [STFICHE] (NOLOCK) ON ([INV].[FICHENO] = [STFICHE].[INVNO]) WHERE [INV].[TRCODE] IN (3, 6, 7, 8, 9, 13) AND [INV].[DATE_] BETWEEN Convert([datetime], '', 102) AND Convert([datetime], '', 102)")
      sql = "select title FROM dbo.MyTable WITH (spatial_window_max_cells = 12) WHERE [release_date] >= '01/01/2021'"
      expect(getParsedSql(sql)).to.equal("SELECT [title] FROM [dbo].[MyTable] WITH (SPATIAL_WINDOW_MAX_CELLS = 12) WHERE [release_date] >= '01/01/2021'")
      expect(tableHintToSQL()).to.be.undefined
    })
  })

  it('should support type as column name', () => {
    let sql = `ALTER TABLE test ADD
    [type] varchar(255) NOT NULL DEFAULT ('default');`
    expect(getParsedSql(sql)).to.equal("ALTER TABLE [test] ADD [type] VARCHAR(255) NOT NULL DEFAULT ('default')")
    sql = `SELECT tipo, [120232] AS 'INTERNAL_FIELD'
    FROM (
         SELECT 'Realizado' AS tipo,  'DESIRED_VALUE' AS [120232]
         FROM docs                -- <<  Replace docs with any table of yours
         WHERE doc_id = '1'
    ) AS result`
    expect(getParsedSql(sql)).to.equal("SELECT [tipo], [120232] AS [INTERNAL_FIELD] FROM (SELECT 'Realizado' AS [tipo], 'DESIRED_VALUE' AS [120232] FROM [docs] WHERE [doc_id] = '1') AS [result]")
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

  it('should support alter table', () => {
    const sql = `ALTER TABLE [Class]
    ADD CONSTRAINT [chk_quizId_or_QuizLink]
    CHECK (
        ([quizId] IS NOT NULL AND [QuizLink] IS NULL) OR
        ([quizId] IS NULL AND [QuizLink] IS NOT NULL)
    );`
    expect(getParsedSql(sql)).to.equal(`ALTER TABLE [Class] ADD CONSTRAINT [chk_quizId_or_QuizLink] CHECK (([quizId] IS NOT NULL AND [QuizLink] IS NULL) OR ([quizId] IS NULL AND [QuizLink] IS NOT NULL))`)
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
  it('should support cast datatime2', () => {
    const sql = "INSERT [dbo].[testtable] ([NodeID], [Timestamp], [ResponseTime], [PercentLoss], [Availability], [Weight]) VALUES (2, CAST(N'2023-04-11T22:17:13.0864249' AS DateTime2), 0, 0, 100, 120)"
    expect(getParsedSql(sql)).to.be.equal("INSERT INTO [dbo].[testtable] (NodeID, Timestamp, ResponseTime, PercentLoss, Availability, Weight) VALUES (2,CAST(N'2023-04-11T22:17:13.0864249' AS DATETIME2),0,0,100,120)")
  })
  it('should support hex string', () => {
    const sql = 'INSERT INTO [dbo].[mytable]([value]) values( 0x11 );'
    expect(getParsedSql(sql)).to.be.equal('INSERT INTO [dbo].[mytable] (value) VALUES (0x11)')
  })
  it('should support for xml', () => {
    const base = `SELECT Cust.CustomerID,
        OrderHeader.CustomerID,
        OrderHeader.SalesOrderID,
        OrderHeader.Status
    FROM Sales.Customer Cust
    INNER JOIN Sales.SalesOrderHeader OrderHeader
    ON Cust.CustomerID = OrderHeader.CustomerID`
    let sql = [base, 'for xml auto'].join('\n')
    const sqlfiyBase = "SELECT [Cust].[CustomerID], [OrderHeader].[CustomerID], [OrderHeader].[SalesOrderID], [OrderHeader].[Status] FROM [Sales].[Customer] AS [Cust] INNER JOIN [Sales].[SalesOrderHeader] AS [OrderHeader] ON [Cust].[CustomerID] = [OrderHeader].[CustomerID]"
    expect(getParsedSql(sql)).to.be.equal(`${sqlfiyBase} FOR XML AUTO`)
    sql = [base, 'for xml path'].join('\n')
    expect(getParsedSql(sql)).to.be.equal(`${sqlfiyBase} FOR XML PATH`)
    sql = [base, 'for xml path(rowName)'].join('\n')
    expect(getParsedSql(sql)).to.be.equal(`${sqlfiyBase} FOR XML PATH([rowName])`)
    sql = [base, 'for xml path(\'\')'].join('\n')
    expect(getParsedSql(sql)).to.be.equal(`${sqlfiyBase} FOR XML PATH('')`)
  })
  it('should support cross and outer apply', () => {
    const applies = ['cross', 'outer']
    for (const apply of applies) {
      const sql = `SELECT SampleParentTable.SampleColumn, SUB.SampleColumn FROM SampleParentTable ${apply} APPLY (SELECT TOP 1 SampleColumn FROM SampleChildTable) SUB`
      expect(getParsedSql(sql)).to.be.equal(`SELECT [SampleParentTable].[SampleColumn], [SUB].[SampleColumn] FROM [SampleParentTable] ${apply.toUpperCase()} APPLY (SELECT TOP 1 [SampleColumn] FROM [SampleChildTable]) AS [SUB]`)
    }
  })
  describe('if else', () => {
    it('should support if only statement', () => {
      const sql = `IF EXISTS(SELECT 1 from sys.views where name='MyView' and type='v')
          DROP view MyView;
        GO`
      expect(getParsedSql(sql)).to.be.equal("IF EXISTS(SELECT 1 FROM [sys].[views] WHERE [name] = 'MyView' AND [type] = 'v') DROP VIEW [MyView]; GO")
    })
    it('should support if else statement', () => {
      const sql = `IF DATENAME(weekday, GETDATE()) IN (N'Saturday', N'Sunday')
                        SELECT 'Weekend';
                  ELSE
                        SELECT 'Weekday';`
      expect(getParsedSql(sql)).to.be.equal("IF DATENAME([weekday], GETDATE()) IN (N'Saturday', N'Sunday') SELECT 'Weekend'; ELSE SELECT 'Weekday';")
    })
  })
  describe('from values', () => {
    it('should support from values', () => {
      const sql = `select * from (values (0, 0), (1, null), (null, 2), (3, 4)) as t(a,b)`
      expect(getParsedSql(sql)).to.be.equal("SELECT * FROM (VALUES (0,0), (1,NULL), (NULL,2), (3,4)) AS [t(a, b)]")
    })
  })
})
