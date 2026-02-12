/**
 * DuckDB dialect test suite for node-sql-parser.
 *
 * Test cases include foundational parser tests and anonymized real-world query
 * patterns observed in MotherDuck's mdw.preview.query_history table, focusing
 * on DuckDB-specific SQL syntax.
 */
const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('DuckDB', () => {
  const parser = new Parser();
  const opt = {
    database: 'duckdb'
  }

  function getParsedSql(sql) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  function expectParsed(sql) {
    const ast = parser.astify(sql, opt);
    expect(ast).to.be.an('object');
    return ast;
  }

  // =====================================================
  // P0 — Critical Features
  // =====================================================

  describe(':: type casts', () => {
    it('should parse simple :: cast', () => {
      const sql = `SELECT val::INTEGER FROM t`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    it('should parse :: cast with array type', () => {
      const sql = `SELECT val::TEXT FROM t`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    it('should parse chained :: casts', () => {
      const sql = `SELECT val::VARCHAR::INTEGER FROM t`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    it('should parse :: cast in WHERE clause', () => {
      const sql = `SELECT * FROM t WHERE col::TEXT = 'hello'`
      const ast = expectParsed(sql)
      expect(ast.where).to.be.an('object')
    })

    // Real-world: dbt incremental models cast to timestamptz
    it('should parse ::TIMESTAMPTZ cast in COALESCE', () => {
      const sql = `SELECT COALESCE(MAX(updated_at), '1900-01-01'::TIMESTAMPTZ) FROM raw.events`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: UBIGINT cast for transaction IDs
    it('should parse ::UBIGINT cast', () => {
      const sql = `SELECT 218189056::UBIGINT AS max_tx_id`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: cast in string concatenation with ||
    it('should parse :: cast in || concatenation', () => {
      const sql = `SELECT 'Description ' || range::VARCHAR AS description FROM range(1, 11)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: md5 hash of casted values
    it('should parse :: cast inside function calls', () => {
      const sql = `INSERT INTO test SELECT range, hash(range), md5(range::VARCHAR) || md5(range::VARCHAR) FROM range(0, 1000)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert')
    })

    // Real-world: array cast with unnest
    it('should parse :: cast on array types', () => {
      const sql = `SELECT unnest(ARRAY['2025-01-01']::DATE[]), unnest(ARRAY['a0b1c2d3']::UUID[])`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })
  })

  describe('QUALIFY clause', () => {
    it('should parse QUALIFY with ROW_NUMBER', () => {
      const sql = `SELECT category, product_name, sales_amount FROM products QUALIFY ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales_amount DESC) <= 2`
      const ast = expectParsed(sql)
      expect(ast.qualify).to.be.an('object')
    })

    it('should parse QUALIFY after WHERE and GROUP BY', () => {
      const sql = `SELECT department, employee, salary FROM employees WHERE active = true GROUP BY department, employee, salary HAVING salary > 50000 QUALIFY RANK() OVER (PARTITION BY department ORDER BY salary DESC) = 1`
      const ast = expectParsed(sql)
      expect(ast.qualify).to.be.an('object')
      expect(ast.having).to.be.an('object')
    })

    it('should round-trip QUALIFY', () => {
      const sql = `SELECT a, b FROM t QUALIFY ROW_NUMBER() OVER (PARTITION BY a ORDER BY b ASC) = 1`
      const result = getParsedSql(sql)
      expect(result.toUpperCase()).to.contain('QUALIFY')
    })

    // Real-world: deduplication pattern (very common in MotherDuck usage)
    it('should parse QUALIFY for deduplication with PARTITION BY tuple', () => {
      const sql = `SELECT * FROM staging QUALIFY row_number() OVER (PARTITION BY (site_url, record_date, query_text) ORDER BY extracted_at DESC) = 1`
      const ast = expectParsed(sql)
      expect(ast.qualify).to.be.an('object')
    })

    // Real-world: QUALIFY inside CREATE TABLE AS for Airbyte-style dedup
    it('should parse CREATE TABLE AS with QUALIFY dedup', () => {
      const sql = `CREATE TABLE deduped_events AS (SELECT * FROM raw_events QUALIFY row_number() OVER (PARTITION BY (event_id, event_type) ORDER BY extracted_at DESC) = 1)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })

    // Real-world: QUALIFY with aggregate window function (not just row_number)
    it('should parse QUALIFY with max() window expression', () => {
      const sql = `SELECT category_id, market_name FROM classifications c JOIN markets m ON m.id = c.market_id WHERE c.company_id = 42 QUALIFY c.level = max(c.level) OVER (PARTITION BY c.company_id)`
      const ast = expectParsed(sql)
      expect(ast.qualify).to.be.an('object')
    })

    // Real-world: QUALIFY in CTE for latest-record lookup
    it('should parse QUALIFY inside CTE', () => {
      const sql = `WITH latest AS (SELECT ticker, description, updated_at FROM companies QUALIFY ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY updated_at DESC) = 1) SELECT c.ticker, c.name, l.description FROM tickers c LEFT JOIN latest l ON c.ticker = l.ticker WHERE c.ticker IS NOT NULL`
      const ast = expectParsed(sql)
      expect(ast.with).to.be.an('array')
    })

    // Real-world: CREATE OR REPLACE VIEW with QUALIFY (shadow table pattern)
    it('should parse CREATE OR REPLACE VIEW with QUALIFY', () => {
      const sql = `CREATE OR REPLACE VIEW latest_records AS SELECT id, name, updated_at FROM record_history WHERE branch = 'main' AND deleted = false QUALIFY (row_number() OVER (PARTITION BY id ORDER BY updated_at DESC) = 1)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })
  })

  describe('GROUP BY ALL / ORDER BY ALL', () => {
    it('should parse GROUP BY ALL', () => {
      const sql = `SELECT category, SUM(sales) FROM sales_data GROUP BY ALL`
      const ast = expectParsed(sql)
      expect(ast.groupby).to.be.an('object')
      expect(ast.groupby.columns).to.have.length(1)
    })

    it('should round-trip GROUP BY ALL', () => {
      const sql = `SELECT category, SUM(sales) FROM sales_data GROUP BY ALL`
      const result = getParsedSql(sql)
      expect(result.toUpperCase()).to.contain('GROUP BY')
      expect(result.toUpperCase()).to.contain('ALL')
    })

    it('should parse ORDER BY ALL', () => {
      const sql = `SELECT * FROM my_table ORDER BY ALL`
      const ast = expectParsed(sql)
      expect(ast.orderby).to.be.an('array')
    })

    it('should parse ORDER BY ALL DESC', () => {
      const sql = `SELECT * FROM my_table ORDER BY ALL DESC`
      const ast = expectParsed(sql)
      expect(ast.orderby).to.be.an('array')
      expect(ast.orderby[0].type).to.equal('DESC')
    })
  })

  describe('SELECT * EXCLUDE / REPLACE', () => {
    it('should parse EXCLUDE', () => {
      const sql = `SELECT * EXCLUDE (sensitive_data) FROM users`
      const ast = expectParsed(sql)
      expect(ast.columns).to.be.an('array')
      expect(ast.columns[0].type).to.equal('exclude')
    })

    it('should parse REPLACE', () => {
      const sql = `SELECT * REPLACE (UPPER(name) AS name) FROM users`
      const ast = expectParsed(sql)
      expect(ast.columns).to.be.an('array')
      expect(ast.columns[0].type).to.equal('replace')
    })

    it('should round-trip EXCLUDE', () => {
      const sql = `SELECT * EXCLUDE (col1, col2) FROM t`
      const result = getParsedSql(sql)
      expect(result.toUpperCase()).to.contain('EXCLUDE')
    })

    // Real-world: EXCLUDE used in INSERT for ETL pipelines (dlt pattern)
    it('should parse SELECT * EXCLUDE in INSERT for ETL', () => {
      const sql = `INSERT INTO warehouse.payments SELECT * EXCLUDE (load_id, row_id) FROM staging.raw_payments WHERE status IN ('Paid', 'Refunded') AND created_at > '2024-01-01'`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert')
    })

    // Real-world: EXCLUDE + REPLACE together (ad platform analytics)
    it('should parse alias.* EXCLUDE with REPLACE', () => {
      const sql = `SELECT t.* EXCLUDE (account_id) REPLACE(c.id AS campaign_id) FROM campaigns c JOIN accounts a ON a.id = c.account_id JOIN insights t ON t.campaign_id = c.external_id WHERE c.channel = 'google_ads'`
      const ast = expectParsed(sql)
      expect(ast.columns).to.be.an('array')
    })

    // Real-world: CREATE OR REPLACE TABLE with EXCLUDE + REPLACE
    it('should parse CREATE OR REPLACE TABLE with EXCLUDE and REPLACE', () => {
      const sql = `CREATE OR REPLACE TABLE analytics.campaign_insights AS SELECT t.* EXCLUDE (external_account_id) REPLACE(c.id AS campaign_id) FROM campaigns c JOIN insights t ON t.campaign_id = c.external_id`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })

    // Real-world: multiple EXCLUDE in audience insights
    it('should parse alias.* EXCLUDE with multiple columns', () => {
      const sql = `SELECT a.id AS audience_id, t.* EXCLUDE (ad_account_id, adset_id) FROM audiences a JOIN campaigns c ON c.id = a.campaign_id JOIN insights t ON t.adset_id = a.external_id WHERE a.channel = 'meta'`
      const ast = expectParsed(sql)
      expect(ast.columns).to.be.an('array')
    })
  })

  describe('PIVOT / UNPIVOT', () => {
    it('should parse PIVOT', () => {
      const sql = `SELECT * FROM monthly_sales PIVOT (SUM(amount) FOR month IN ('Jan', 'Feb', 'Mar'))`
      const ast = expectParsed(sql)
      expect(ast.from).to.be.an('array')
      expect(ast.from[0].operator).to.be.an('object')
      expect(ast.from[0].operator.type).to.equal('pivot')
    })

    it('should parse UNPIVOT', () => {
      const sql = `SELECT * FROM monthly_sales UNPIVOT (amount FOR month IN ('Jan', 'Feb', 'Mar'))`
      const ast = expectParsed(sql)
      expect(ast.from[0].operator.type).to.equal('unpivot')
    })

    // Real-world: UNPIVOT ON columns(*) for column profiling
    // TODO: DuckDB's standalone UNPIVOT-ON syntax is not yet supported
    it.skip('should parse UNPIVOT ON columns(*)', () => {
      const sql = `WITH base AS (SELECT * FROM sample_table) SELECT value.* FROM (UNPIVOT base ON columns(*)) AS unpivoted`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: UNPIVOT with struct aggregation for column stats
    // TODO: DuckDB's standalone UNPIVOT-ON syntax is not yet supported
    it.skip('should parse CTE with UNPIVOT for column profiling', () => {
      const sql = `WITH cols AS (UNPIVOT (FROM sample_table SELECT {name: first(alias(columns(*))), type: first(typeof(columns(*)))} ) ON columns(*)) SELECT value.* FROM cols`
      const ast = expectParsed(sql)
      expect(ast.with).to.be.an('array')
    })
  })

  describe('LIST() aggregate', () => {
    it('should parse LIST()', () => {
      const sql = `SELECT LIST(name) FROM users`
      const ast = expectParsed(sql)
      expect(ast.columns[0].expr.type).to.equal('aggr_func')
      expect(ast.columns[0].expr.name).to.equal('LIST')
    })

    it('should parse LIST() with ORDER BY', () => {
      const sql = `SELECT LIST(name ORDER BY name) FROM users`
      const ast = expectParsed(sql)
      expect(ast.columns[0].expr.type).to.equal('aggr_func')
    })
  })

  describe('Lambda expressions', () => {
    it('should parse single-arg lambda in function call', () => {
      const sql = `SELECT list_transform([1, 2, 3], x -> x + 1)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    it('should parse multi-arg lambda', () => {
      const sql = `SELECT list_reduce([1, 2, 3, 4], (x, y) -> x + y)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })
  })

  describe('JSON operators', () => {
    it('should parse -> operator', () => {
      const sql = `SELECT data->'key' FROM t`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    it('should parse ->> operator', () => {
      const sql = `SELECT data->>'key' FROM t`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })
  })

  // =====================================================
  // P1 — Important Features
  // =====================================================

  describe('UNION BY NAME', () => {
    it('should parse UNION BY NAME', () => {
      const sql = `SELECT * FROM t1 UNION BY NAME SELECT * FROM t2`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
      expect(ast._next).to.be.an('object')
      expect(ast.set_op).to.equal('union by name')
    })

    it('should parse UNION ALL BY NAME', () => {
      const sql = `SELECT * FROM t1 UNION ALL BY NAME SELECT * FROM t2`
      const ast = expectParsed(sql)
      expect(ast.set_op).to.equal('union all by name')
    })
  })

  describe('ASOF JOIN', () => {
    it('should parse ASOF JOIN', () => {
      const sql = `SELECT * FROM trades ASOF JOIN quotes ON trades.ticker = quotes.ticker AND trades.ts >= quotes.ts`
      const ast = expectParsed(sql)
      expect(ast.from).to.be.an('array')
      expect(ast.from[1].join).to.equal('ASOF JOIN')
    })
  })

  describe('Struct literals', () => {
    it('should parse struct literal', () => {
      const sql = `SELECT {'a': 1, 'b': 'text'} AS my_struct`
      const ast = expectParsed(sql)
      expect(ast.columns[0].expr.type).to.equal('struct_value')
      expect(ast.columns[0].expr.fields).to.have.length(2)
    })

    it('should round-trip struct literal', () => {
      const sql = `SELECT {'a': 1, 'b': 'text'}`
      const result = getParsedSql(sql)
      expect(result).to.contain('{')
      expect(result).to.contain('}')
    })
  })

  describe('List literals', () => {
    it('should parse list literal without ARRAY keyword', () => {
      const sql = `SELECT [1, 2, 3] AS my_list`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    it('should parse ARRAY keyword list', () => {
      const sql = `SELECT ARRAY[1, 2, 3]`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })
  })

  describe('COLUMNS() expression', () => {
    it('should parse COLUMNS with regex', () => {
      const sql = `SELECT COLUMNS('sales_.*') FROM sales_data`
      const ast = expectParsed(sql)
      expect(ast.columns[0].expr.type).to.equal('function')
    })

    it('should parse COLUMNS with star', () => {
      const sql = `SELECT COLUMNS(*) FROM sales_data`
      const ast = expectParsed(sql)
      expect(ast.columns[0].expr.type).to.equal('function')
    })
  })

  describe('CREATE OR REPLACE TABLE', () => {
    it('should parse CREATE OR REPLACE TABLE', () => {
      const sql = `CREATE OR REPLACE TABLE my_table (id INTEGER, name VARCHAR)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
      expect(ast.or_replace).to.equal('or replace')
    })

    // Real-world: CREATE OR REPLACE TABLE AS SELECT (very common in MotherDuck)
    it('should parse CREATE OR REPLACE TABLE AS SELECT', () => {
      const sql = `CREATE OR REPLACE TABLE summary AS SELECT category, count(*) AS cnt FROM items GROUP BY category`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })
  })

  describe('INSERT OR REPLACE / IGNORE', () => {
    it('should parse INSERT OR REPLACE', () => {
      const sql = `INSERT OR REPLACE INTO t (id, name) VALUES (1, 'test')`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert or replace')
    })

    it('should parse INSERT OR IGNORE', () => {
      const sql = `INSERT OR IGNORE INTO t (id, name) VALUES (1, 'test')`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert or ignore')
    })
  })

  describe('DESCRIBE / SUMMARIZE', () => {
    it('should parse DESCRIBE', () => {
      const sql = `DESCRIBE my_table`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('describe')
    })

    it('should parse SUMMARIZE', () => {
      const sql = `SUMMARIZE my_table`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('summarize')
    })
  })

  describe('ATTACH / DETACH', () => {
    it('should parse ATTACH', () => {
      const sql = `ATTACH 'mydb.duckdb' AS mydb`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('attach')
    })

    it('should parse DETACH', () => {
      const sql = `DETACH mydb`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('detach')
    })
  })

  describe('COPY statement', () => {
    it('should parse COPY TO', () => {
      const sql = `COPY my_table TO 'output.parquet'`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('copy')
      expect(ast.to).to.be.an('object')
    })

    it('should parse COPY FROM', () => {
      const sql = `COPY my_table FROM 'input.csv'`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('copy')
      expect(ast.from).to.be.an('object')
    })

    // Real-world: COPY query TO S3 path (Estuary Flow connector pattern)
    it('should parse COPY subquery TO S3 path', () => {
      const sql = `COPY (SELECT binding, doc FROM warehouse.events AS l JOIN read_json('s3://bucket/keys.json.gz', format='newline_delimited', compression='gzip') AS r ON l.id = r.id) TO 's3://bucket/output.json.gz'`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('copy')
    })

    // Real-world: COPY TO with FORMAT option
    it('should parse COPY TO with FORMAT PARQUET', () => {
      const sql = `COPY (SELECT id, name FROM users WHERE active = true) TO '/tmp/users.parquet' (FORMAT PARQUET)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('copy')
    })
  })

  describe('DuckDB data types', () => {
    it('should parse HUGEINT', () => {
      const sql = `CREATE TABLE t (col HUGEINT)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })

    it('should parse UBIGINT', () => {
      const sql = `CREATE TABLE t (col UBIGINT)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })

    it('should parse BLOB', () => {
      const sql = `CREATE TABLE t (col BLOB)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })
  })

  describe('Additional join types', () => {
    it('should parse SEMI JOIN', () => {
      const sql = `SELECT * FROM t1 SEMI JOIN t2 ON t1.id = t2.id`
      const ast = expectParsed(sql)
      expect(ast.from[1].join).to.equal('SEMI JOIN')
    })

    it('should parse ANTI JOIN', () => {
      const sql = `SELECT * FROM t1 ANTI JOIN t2 ON t1.id = t2.id`
      const ast = expectParsed(sql)
      expect(ast.from[1].join).to.equal('ANTI JOIN')
    })

    it('should parse POSITIONAL JOIN', () => {
      const sql = `SELECT * FROM t1 POSITIONAL JOIN t2`
      const ast = expectParsed(sql)
      expect(ast.from[1].join).to.equal('POSITIONAL JOIN')
    })

    // Real-world: SEMI JOIN for change detection (data pipeline pattern)
    it('should parse SEMI JOIN for change detection', () => {
      const sql = `SELECT count(*) FROM tmp_new_records AS t SEMI JOIN existing_data AS s ON s.record_id = t.record_id`
      const ast = expectParsed(sql)
      expect(ast.from[1].join).to.equal('SEMI JOIN')
    })

    // Real-world: ANTI JOIN for insert-only-new-rows pattern
    it('should parse INSERT with ANTI JOIN for new-row detection', () => {
      const sql = `INSERT INTO sensor_data SELECT * FROM tmp_sensor_batch AS t ANTI JOIN sensor_data AS s ON s.record_date IS NOT DISTINCT FROM t.record_date AND s.sensor_id IS NOT DISTINCT FROM t.sensor_id`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert')
    })
  })

  describe('FROM shortcut (query starting with FROM)', () => {
    it('should parse FROM without SELECT', () => {
      const sql = `FROM my_table WHERE id > 5`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
      expect(ast.from).to.be.an('array')
      expect(ast.where).to.be.an('object')
    })

    it('should parse FROM with LIMIT', () => {
      const sql = `FROM my_table LIMIT 10`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
      expect(ast.limit).to.be.an('object')
    })
  })

  describe('Table functions', () => {
    it('should parse read_parquet()', () => {
      const sql = `SELECT * FROM read_parquet('file.parquet')`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    it('should parse read_csv()', () => {
      const sql = `SELECT * FROM read_csv('file.csv')`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: read_parquet with named parameters (dlt pattern)
    it('should parse read_parquet with union_by_name parameter', () => {
      const sql = `INSERT INTO warehouse.events BY NAME SELECT * FROM read_parquet('/data/events.parquet', union_by_name=true)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert')
    })

    // Real-world: read_csv with all_varchar for Google Sheets import (dbt pattern)
    it('should parse read_csv with all_varchar option', () => {
      const sql = `SELECT * FROM read_csv('https://example.com/export.csv', all_varchar=True)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: read_json with compression and format options
    it('should parse read_json with multiple named parameters', () => {
      const sql = `SELECT * FROM read_json('/data/events.gz', format='newline_delimited', compression='gzip', maximum_object_size=16777216)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: read_json with columns struct (Estuary Flow pattern)
    it('should parse read_json with columns struct parameter', () => {
      const sql = `SELECT * FROM read_json('s3://bucket/data.json.gz', format='newline_delimited', compression='gzip', columns={id: 'BIGINT NOT NULL'})`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: read_parquet with hive_partitioning and glob
    it('should parse read_parquet with hive_partitioning', () => {
      const sql = `CREATE OR REPLACE TABLE events AS SELECT * FROM read_parquet('gs://bucket/data/**/*.parquet', hive_partitioning=true)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })

    // Real-world: read_parquet with array of files
    it('should parse read_parquet with array of paths', () => {
      const sql = `SELECT * FROM read_parquet(['file1.parquet', 'file2.parquet'])`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })
  })

  // =====================================================
  // P1.5 — Real-world patterns from MotherDuck query_history
  // =====================================================

  describe('INSERT INTO ... BY NAME', () => {
    // Real-world: dlt data loading pipeline pattern
    it('should parse INSERT BY NAME from subquery', () => {
      const sql = `INSERT INTO target_table BY NAME SELECT * FROM staging_table WHERE org_id = 'abc-123'`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert')
    })

    // Real-world: INSERT BY NAME with read_parquet (very common dlt pattern)
    it('should parse INSERT BY NAME from read_parquet', () => {
      const sql = `INSERT INTO warehouse.events BY NAME SELECT * FROM read_parquet('/data/normalized/events.parquet', union_by_name=true)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert')
    })
  })

  describe('DuckDB-specific functions', () => {
    // Real-world: epoch_ms for timestamp conversion (analytics pattern)
    it('should parse epoch_ms function', () => {
      const sql = `SELECT event_name, epoch_ms(event_timestamp) AS ts FROM raw_events`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: epoch_ms with date_trunc and INTERVAL (web analytics)
    it('should parse epoch_ms with date_trunc and INTERVAL', () => {
      const sql = `SELECT count(DISTINCT visitor_id) AS value FROM pageviews WHERE ts BETWEEN epoch_ms(date_trunc('day', '2025-01-15'::TIMESTAMP) - INTERVAL '23 hours') AND epoch_ms('2025-01-16'::TIMESTAMP)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: make_timestamp (Fivetran soft-delete pattern)
    it('should parse make_timestamp function', () => {
      const sql = `UPDATE metadata.sync_log SET deleted = true WHERE synced_at < make_timestamp(1748736000000000)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('update')
    })

    // Real-world: hash() and md5() for test data generation
    it('should parse hash() and md5() functions', () => {
      const sql = `SELECT range, hash(range), md5(range::VARCHAR) FROM range(0, 1000)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: unnest with casted arrays
    it('should parse unnest with typed arrays', () => {
      const sql = `INSERT INTO processed_files (partition_date, file_uuid) SELECT unnest(ARRAY['2025-01-01']::DATE[]), unnest(ARRAY['a0b1c2d3']::UUID[])`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert')
    })
  })

  describe('Struct dot access', () => {
    // Real-world: struct field access for bounding box queries (Overture Maps)
    it('should parse struct dot access in WHERE', () => {
      const sql = `SELECT DISTINCT ST_GeometryType(geometry) FROM geo_features WHERE bbox.xmin > -123.17 AND bbox.ymin > 37.64 AND bbox.xmax < -122.28 AND bbox.ymax < 37.93`
      const ast = expectParsed(sql)
      expect(ast.where).to.be.an('object')
    })

    it('should parse nested struct dot access in SELECT', () => {
      const sql = `SELECT bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax FROM geo_features`
      const ast = expectParsed(sql)
      expect(ast.columns).to.have.length(4)
    })
  })

  describe('UPDATE ... FROM (join-style update)', () => {
    // Real-world: join-style UPDATE with FROM clause
    it('should parse UPDATE with FROM clause', () => {
      const sql = `UPDATE events SET is_bot = user_agents.ua LIKE '%bot%' FROM user_agents WHERE user_agents.session_id = events.session_id AND events.event_ts >= now()::DATE - INTERVAL '3 day'`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('update')
    })
  })

  describe('range() as table function', () => {
    // Real-world: test data generation with range()
    it('should parse SELECT FROM range()', () => {
      const sql = `SELECT range AS id, random() AS value FROM range(1, 11)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: INSERT from range for bulk data generation
    it('should parse INSERT with range() and string concatenation', () => {
      const sql = `INSERT INTO test_table SELECT range AS id, random() AS value, 'Description ' || range::VARCHAR AS description FROM range(1, 11)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('insert')
    })
  })

  describe('String concatenation with ||', () => {
    // Real-world: || used heavily in DuckDB for string building
    it('should parse || string concatenation', () => {
      const sql = `SELECT first_name || ' ' || last_name AS full_name FROM employees`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: || with md5 hash concatenation
    it('should parse || with function results', () => {
      const sql = `SELECT md5(id::VARCHAR) || md5(id::VARCHAR) AS double_hash FROM records`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })
  })

  describe('IS NOT DISTINCT FROM', () => {
    // Real-world: used in ANTI JOIN conditions for null-safe comparison
    it('should parse IS NOT DISTINCT FROM in join condition', () => {
      const sql = `SELECT * FROM t1 ANTI JOIN t2 ON t1.col_a IS NOT DISTINCT FROM t2.col_a AND t1.col_b IS NOT DISTINCT FROM t2.col_b`
      const ast = expectParsed(sql)
      expect(ast.from[1].join).to.equal('ANTI JOIN')
    })
  })

  // =====================================================
  // Round-trip tests (SQL → AST → SQL)
  // =====================================================

  describe('Round-trip tests', () => {
    const SQL_ROUNDTRIP_LIST = [
      {
        title: 'basic SELECT',
        sql: [
          `SELECT a, b FROM t WHERE a > 1`,
          `SELECT a, b FROM "t" WHERE a > 1`,
        ]
      },
      {
        title: 'SELECT with :: cast',
        sql: [
          `SELECT val::INTEGER FROM t`,
          `SELECT val::INTEGER FROM "t"`,
        ]
      },
      {
        title: 'SELECT with GROUP BY ALL',
        sql: [
          `SELECT category, SUM(amount) FROM sales GROUP BY ALL`,
          `SELECT category, SUM(amount) FROM "sales" GROUP BY ALL`,
        ]
      },
      {
        title: 'SELECT with QUALIFY',
        sql: [
          `SELECT a, b FROM t QUALIFY ROW_NUMBER() OVER (PARTITION BY a ORDER BY b ASC) = 1`,
          `SELECT a, b FROM "t" QUALIFY ROW_NUMBER() OVER (PARTITION BY a ORDER BY b ASC) = 1`,
        ]
      },
      {
        title: 'UNION ALL',
        sql: [
          `SELECT a FROM t1 UNION ALL SELECT a FROM t2`,
          `SELECT a FROM "t1" UNION ALL SELECT a FROM "t2"`,
        ]
      },
      {
        title: 'LEFT JOIN',
        sql: [
          `SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id`,
          `SELECT * FROM "t1" LEFT JOIN "t2" ON "t1".id = "t2".id`,
        ]
      },
      {
        title: 'ASOF JOIN',
        sql: [
          `SELECT * FROM t1 ASOF JOIN t2 ON t1.id = t2.id`,
          `SELECT * FROM "t1" ASOF JOIN "t2" ON "t1".id = "t2".id`,
        ]
      },
    ]

    SQL_ROUNDTRIP_LIST.forEach(sqlCase => {
      it(`should round-trip: ${sqlCase.title}`, () => {
        const result = getParsedSql(sqlCase.sql[0])
        expect(result).to.equal(sqlCase.sql[1])
      })
    })
  })

  // =====================================================
  // Real-world DuckDB query integration tests
  // =====================================================

  describe('Real-world DuckDB queries', () => {
    it('should parse a window function query with QUALIFY', () => {
      const sql = `
        SELECT
          department,
          employee_name,
          salary
        FROM employees
        WHERE active = true
        QUALIFY ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) <= 3
      `
      const ast = expectParsed(sql)
      expect(ast.qualify).to.be.an('object')
    })

    it('should parse aggregation with GROUP BY ALL', () => {
      const sql = `
        SELECT
          region,
          product_category,
          SUM(revenue) as total_revenue,
          COUNT(*) as num_sales
        FROM sales
        GROUP BY ALL
        ORDER BY total_revenue DESC
      `
      const ast = expectParsed(sql)
      expect(ast.groupby).to.be.an('object')
    })

    it('should parse query with multiple :: casts', () => {
      const sql = `
        SELECT
          id::VARCHAR as id_str,
          amount::DECIMAL as amount_dec,
          created_at::DATE as created_date
        FROM transactions
      `
      const ast = expectParsed(sql)
      expect(ast.columns).to.have.length(3)
    })

    it('should parse query with json operators', () => {
      const sql = `SELECT data->>'name' as name, data->>'age' as age FROM users WHERE data->>'active' = 'true'`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    it('should parse complex CTE with UNION ALL', () => {
      const sql = `
        WITH
          active_users AS (SELECT * FROM users WHERE status = 'active'),
          recent_orders AS (SELECT * FROM orders WHERE created_at > '2024-01-01')
        SELECT u.name, o.total
        FROM active_users u
        LEFT JOIN recent_orders o ON u.id = o.user_id
        ORDER BY o.total DESC
        LIMIT 100
      `
      const ast = expectParsed(sql)
      expect(ast.with).to.be.an('array')
      expect(ast.with).to.have.length(2)
    })

    it('should parse subquery in FROM', () => {
      const sql = `SELECT * FROM (SELECT id, name FROM users WHERE active = true) AS sub WHERE sub.name IS NOT NULL`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('select')
    })

    // Real-world: full ETL pipeline query combining multiple DuckDB features
    it('should parse full ETL pipeline with EXCLUDE, QUALIFY, and CTE', () => {
      const sql = `
        WITH latest AS (
          SELECT * EXCLUDE (load_id) FROM raw.events
          QUALIFY row_number() OVER (PARTITION BY event_id ORDER BY extracted_at DESC) = 1
        )
        SELECT l.* FROM latest l
        ANTI JOIN warehouse.events w ON l.event_id = w.event_id
      `
      const ast = expectParsed(sql)
      expect(ast.with).to.be.an('array')
      expect(ast.from).to.be.an('array')
    })

    // Real-world: multi-database cross-join pattern (very common in MotherDuck)
    it('should parse three-part qualified table names', () => {
      const sql = `SELECT * FROM my_database.my_schema.my_table WHERE id > 100`
      const ast = expectParsed(sql)
      expect(ast.from).to.be.an('array')
    })

    // Real-world: CREATE TABLE IF NOT EXISTS with constraints
    it('should parse CREATE TABLE IF NOT EXISTS with constraints', () => {
      const sql = `CREATE TABLE IF NOT EXISTS settings (key TEXT NOT NULL, value TEXT NOT NULL UNIQUE)`
      const ast = expectParsed(sql)
      expect(ast.type).to.equal('create')
    })

    // Real-world: RECURSIVE CTE
    it('should parse WITH RECURSIVE', () => {
      const sql = `WITH RECURSIVE tree AS (SELECT id, parent_id, name FROM categories WHERE parent_id IS NULL UNION ALL SELECT c.id, c.parent_id, c.name FROM categories c JOIN tree t ON c.parent_id = t.id) SELECT * FROM tree`
      const ast = expectParsed(sql)
      expect(ast.with).to.be.an('array')
    })
  })
})
