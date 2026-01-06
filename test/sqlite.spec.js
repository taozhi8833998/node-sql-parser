const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('sqlite', () => {
  const parser = new Parser();
  const DEFAULT_OPT =  { database: 'sqlite' }

  function getParsedSql(sql, opt = DEFAULT_OPT) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('should support analyze', () => {
    const sql = 'analyze schemaName.tableName'
    expect(getParsedSql(sql)).to.be.equal('ANALYZE "schemaName"."tableName"')
  })

  it('should support attach', () => {
    const sql = "attach database 'c:\sqlite\db\contacts.db' as contacts;"
    expect(getParsedSql(sql)).to.be.equal(`ATTACH DATABASE 'c:sqlitedbcontacts.db' AS "contacts"`)
  })

  it('should support json function in from clause', () => {
    const sql = `SELECT json_extract(value, '$.id') AS author_id
    FROM
        post,
        json_each(post.author, '$')
    GROUP BY
        author_id;`
    expect(getParsedSql(sql)).to.be.equal(`SELECT json_extract("value", '$.id') AS "author_id" FROM "post", json_each("post"."author", '$') GROUP BY "author_id"`)
  })

  it('should support || in where clause', () => {
    const sql = `SELECT *
    FROM
        pets
        LEFT JOIN(
            SELECT * FROM user
            WHERE user.name = "pepe" || "rone"
        ) u ON pets.owner = u.id
    GROUP BY pets.id;`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM "pets" LEFT JOIN (SELECT * FROM "user" WHERE "user"."name" = "pepe" || "rone") AS "u" ON "pets"."owner" = "u"."id" GROUP BY "pets"."id"')
  })

  it('should support or combine with )', () => {
    let sql = `SELECT *
    FROM
        pets
        LEFT JOIN(
            SELECT * FROM user
            WHERE user.code = UPPER("test")
            OR user.name = "pepe") u ON pets.owner = u.id
    GROUP BY pets.id;`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM "pets" LEFT JOIN (SELECT * FROM "user" WHERE "user"."code" = UPPER("test") OR "user"."name" = "pepe") AS "u" ON "pets"."owner" = "u"."id" GROUP BY "pets"."id"')
    sql = `SELECT *
    FROM
        pets
        LEFT JOIN(
            SELECT * FROM user
            WHERE user.name = "pepe" || "rone"
            OR user.code = UPPER("test")
            OR user.code = UPPER("more_test")
        ) u ON pets.owner = u.id
    GROUP BY pets.id;`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM "pets" LEFT JOIN (SELECT * FROM "user" WHERE "user"."name" = "pepe" || "rone" OR "user"."code" = UPPER("test") OR "user"."code" = UPPER("more_test")) AS "u" ON "pets"."owner" = "u"."id" GROUP BY "pets"."id"')
  })

  it('should support json as function name', () => {
    const sql = `SELECT
      id,
      json_object(
          'hasGeometry',
          CASE
              WHEN json_extract(floor.rect, '$') IS '{"boundariesList":[]}' THEN json('false')
              ELSE json('true')
          END
      ) as "metadata"
  FROM
      floor
  WHERE
    floor.id = 1;`
    expect(getParsedSql(sql)).to.be.equal(`SELECT "id", json_object('hasGeometry', CASE WHEN json_extract("floor"."rect", '$') IS '{"boundariesList":[]}' THEN json('false') ELSE json('true') END) AS "metadata" FROM "floor" WHERE "floor"."id" = 1`)
  })

  it('should support glob operator', () => {
    const sql = "SELECT device.id FROM device WHERE device.model GLOB '*XYZ';"
    expect(getParsedSql(sql)).to.be.equal(`SELECT "device"."id" FROM "device" WHERE "device"."model" GLOB '*XYZ'`)
  })

  it('should support create table...as', () => {
    const sql = `CREATE TABLE IF NOT EXISTS stg_devices AS SELECT * FROM devices WHERE 1 = 0;`
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE IF NOT EXISTS "stg_devices" AS SELECT * FROM "devices" WHERE 1 = 0')
  })

  it('should support escape single quote', () => {
    const sql = "SELECT name, 'doesn''t smoke' FROM people WHERE name = 'John';"
    expect(getParsedSql(sql)).to.be.equal(`SELECT "name", 'doesn''t smoke' FROM "people" WHERE "name" = 'John'`)
  })

  it('should support create with autoincrement, boolean type and definition could be empty', () => {
    let sql = 'CREATE TABLE `foobar1` (`id` integer not null primary key autoincrement, `name` varchar(255), `batch` boolean, `migration_time` datetime)'
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE "foobar1" ("id" INTEGER NOT NULL AUTOINCREMENT PRIMARY KEY, "name" VARCHAR(255), "batch" BOOLEAN, "migration_time" DATETIME)')
    sql = 'CREATE TABLE sqlite_stat4(tbl,idx,neq,nlt,ndlt,sample)'
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE "sqlite_stat4" ("tbl", "idx", "neq", "nlt", "ndlt", "sample")')
  })

  it('should support with clause table name', () => {
    const sql = 'with `e` as (select * from employees) SELECT name,`e`.`hired_on` FROM `e`'
    expect(getParsedSql(sql)).to.be.equal('WITH "e" AS (SELECT * FROM "employees") SELECT "name", "e"."hired_on" FROM "e"')
  })

  it('should support blob type', () => {
    const sql = `CREATE TABLE "session_caches" (
      "service_name"	TEXT NOT NULL,
      "session_data"	BLOB NOT NULL,
      "expires_at"	INTEGER,
      PRIMARY KEY("service_name","expires_at")
    )`
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE "session_caches" ("service_name" TEXT NOT NULL, "session_data" BLOB NOT NULL, "expires_at" INTEGER, PRIMARY KEY ("service_name", "expires_at"))')
  })
  it('should support missing number after dot in number', () => {
    const sql = 'select count(*)*1. from abc'
    expect(getParsedSql(sql)).to.be.equal('SELECT COUNT(*) * 1 FROM "abc"')
  })
  it('should support create trigger', () => {
    let sql = `CREATE TRIGGER update_customer_address UPDATE OF address ON customers
    BEGIN
      UPDATE orders SET address = new.address WHERE customer_name = old.name;
    END;`
    expect(getParsedSql(sql)).to.be.equal('CREATE TRIGGER "update_customer_address" UPDATE OF "address" ON "customers" BEGIN UPDATE "orders" SET "address" = "new"."address" WHERE "customer_name" = "old"."name" END')
  })

  it('should support union', () => {
    let sql = `SELECT * FROM a UNION SELECT * FROM b`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM "a" UNION SELECT * FROM "b"')

    sql = `SELECT * FROM a UNION ALL SELECT * FROM b`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM "a" UNION ALL SELECT * FROM "b"')

    sql = `SELECT * FROM a UNION DISTINCT SELECT * FROM b`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM "a" UNION DISTINCT SELECT * FROM "b"')
  })

  it('should support keyword as column name in sql', () => {
    let sql = 'CREATE TABLE IF NOT EXISTS "Test" (Id INTEGER NOT NULL PRIMARY KEY UNIQUE, like TEXT NOT NULL, Difficulty TEXT, percent real, PRIMARY KEY(Id));'
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE IF NOT EXISTS "Test" ("Id" INTEGER NOT NULL PRIMARY KEY UNIQUE, "like" TEXT NOT NULL, "Difficulty" TEXT, "percent" REAL, PRIMARY KEY ("Id"))')
    sql = "SELECT * from tb WHERE NOT EXISTS (SELECT * FROM tb WHERE field1 = 'c' AND field2 = d)"
    expect(getParsedSql(sql)).to.be.equal(`SELECT * FROM "tb" WHERE NOT EXISTS (SELECT * FROM "tb" WHERE "field1" = 'c' AND "field2" = "d")`)
    sql = 'SELECT * FROM tb WHERE key="foo"'
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM "tb" WHERE "key" = "foo"')
    sql = 'SELECT column_name from table_name where type= "abc"'
    expect(getParsedSql(sql)).to.be.equal('SELECT "column_name" FROM "table_name" WHERE "type" = "abc"')
    sql = "SELECT partition from table_name where partition like '%'"
    expect(getParsedSql(sql)).to.be.equal(`SELECT "partition" FROM "table_name" WHERE "partition" LIKE '%'`)
    sql = `SELECT "m"."model_family", COUNT(*) AS "total_mentions" FROM "brand_mentions" AS "bm" INNER JOIN "model_responses" AS "mr" ON "bm"."response_id" = "mr"."response_id" INNER JOIN "models" AS "m" ON "mr"."model_id" = "m"."model_id" WHERE "bm"."brand_name" = 'ketch' AND "m"."model_family" IN ('a', 'b', 'c') AND "mr"."error_occurred" = 0 GROUP BY "m"."model_family" LIMIT 100`
    expect(getParsedSql(sql)).to.be.equal(`SELECT "m"."model_family", COUNT(*) AS "total_mentions" FROM "brand_mentions" AS "bm" INNER JOIN "model_responses" AS "mr" ON "bm"."response_id" = "mr"."response_id" INNER JOIN "models" AS "m" ON "mr"."model_id" = "m"."model_id" WHERE "bm"."brand_name" = 'ketch' AND "m"."model_family" IN ('a', 'b', 'c') AND "mr"."error_occurred" = 0 GROUP BY "m"."model_family" LIMIT 100`)
  })

  it('should support sqlify autoincrement to other db', () => {
    let sql = 'CREATE TABLE IF NOT EXISTS "SampleTable" ( "ID" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT UNIQUE, "Name" TEXT NOT NULL);'
    let ast = parser.astify(sql, DEFAULT_OPT)
    expect(parser.sqlify(ast, { database: 'mariadb'})).to.be.equal('CREATE TABLE IF NOT EXISTS `SampleTable` (`ID` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY UNIQUE, `Name` TEXT NOT NULL)')
    sql = ' CREATE TABLE `Test` (  `id` int(11) NOT NULL,  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,  PRIMARY KEY (`id`),  UNIQUE KEY `name` (`name`));'
    ast = parser.astify(sql, { database: 'mariadb' })
    expect(parser.sqlify(ast, DEFAULT_OPT)).to.be.equal('CREATE TABLE "Test" ("id" INT(11) NOT NULL, "name" VARCHAR(255) NOT NULL, PRIMARY KEY ("id"), UNIQUE ("name"))')
    sql = `SELECT
          b.brand_name,
          p.prompt_text,
          m.model_name,
          mr.brand_visibility_score,
          AVG(mr.brand_visibility_score) OVER (PARTITION BY b.brand_name) as avg_brand_visibility,
          AVG(mr.brand_visibility_score) OVER (PARTITION BY m.model_name) as avg_model_visibility,
          AVG(mr.brand_visibility_score) OVER (PARTITION BY p.prompt_id) as avg_prompt_visibility
      FROM model_responses mr
      INNER JOIN experiment_runs er ON mr.run_id = er.run_id
      INNER JOIN brands b ON er.brand_id = b.brand_id
      INNER JOIN models m ON mr.model_id = m.model_id
      INNER JOIN prompts p ON mr.prompt_id = p.prompt_id
      WHERE b.brand_name IN ('prod1', 'prod2', 'prod3')
          AND mr.error_occurred = 0
      ORDER BY b.brand_name, mr.brand_visibility_score DESC, m.model_name, p.prompt_text
      LIMIT 100`
    expect(getParsedSql(sql)).to.be.equal(`SELECT "b"."brand_name", "p"."prompt_text", "m"."model_name", "mr"."brand_visibility_score", AVG("mr"."brand_visibility_score") OVER (PARTITION BY "b"."brand_name" ) AS "avg_brand_visibility", AVG("mr"."brand_visibility_score") OVER (PARTITION BY "m"."model_name" ) AS "avg_model_visibility", AVG("mr"."brand_visibility_score") OVER (PARTITION BY "p"."prompt_id" ) AS "avg_prompt_visibility" FROM "model_responses" AS "mr" INNER JOIN "experiment_runs" AS "er" ON "mr"."run_id" = "er"."run_id" INNER JOIN "brands" AS "b" ON "er"."brand_id" = "b"."brand_id" INNER JOIN "models" AS "m" ON "mr"."model_id" = "m"."model_id" INNER JOIN "prompts" AS "p" ON "mr"."prompt_id" = "p"."prompt_id" WHERE "b"."brand_name" IN ('prod1', 'prod2', 'prod3') AND "mr"."error_occurred" = 0 ORDER BY "b"."brand_name" ASC, "mr"."brand_visibility_score" DESC, "m"."model_name" ASC, "p"."prompt_text" ASC LIMIT 100`)
  })

  it('should support create or drop view', () => {
    let sql = 'create view v1 as select * from t1'
    expect(getParsedSql(sql)).to.be.equal('CREATE VIEW "v1" AS SELECT * FROM "t1"')
    sql = 'create temp view if not exists s.v1(a, b, c) as select * from t1'
    expect(getParsedSql(sql)).to.be.equal('CREATE TEMP VIEW IF NOT EXISTS "s"."v1" ("a", "b", "c") AS SELECT * FROM "t1"')
    sql = 'DROP VIEW IF EXISTS view_name;',
    expect(getParsedSql(sql)).to.be.equal('DROP VIEW IF EXISTS "view_name"')
  })

  it('should create table and alter table', () => {
  let sql = `CREATE TABLE IF NOT EXISTS posts (
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    ) WITHOUT ROWID;
    `
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE IF NOT EXISTS "posts" ("user_id" INTEGER NOT NULL, FOREIGN KEY ("user_id") REFERENCES "users" ("user_id")) WITHOUT ROWID')
    sql = 'CREATE TABLE users (age INTEGER CHECK(age >= 18)) STRICT, WITHOUT ROWID;'
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE "users" ("age" INTEGER CHECK ("age" >= 18)) STRICT, WITHOUT ROWID')
    sql = 'ALTER TABLE customers RENAME COLUMN age TO customer_age;'
    expect(getParsedSql(sql)).to.be.equal('ALTER TABLE "customers" RENAME COLUMN "age" TO "customer_age"')
  })

  it('should support double equal', () => {
    const sql = "SELECT * FROM sqlite_master WHERE name == 'test'"
    expect(getParsedSql(sql)).to.be.equal(`SELECT * FROM "sqlite_master" WHERE "name" == 'test'`)
  })

  it('should support subquery', () => {
    const sql = `SELECT SUM("Hours Spent") AS "Total Hours"
      FROM "Work_Records"
      WHERE "Partner ID" =
        (SELECT "Partner ID"
        FROM "Employees"
        WHERE "Firstname" = 'John' AND "Lastname" = 'Smith')
    `
    expect(getParsedSql(sql)).to.be.equal(`SELECT SUM("Hours Spent") AS "Total Hours" FROM "Work_Records" WHERE "Partner ID" = (SELECT "Partner ID" FROM "Employees" WHERE "Firstname" = 'John' AND "Lastname" = 'Smith')`)
  })
  it('should support create index', () => {
    let sql = 'CREATE INDEX visits_url_index ON visits (url);'
    expect(getParsedSql(sql)).to.be.equal('CREATE INDEX "visits_url_index" ON "visits" ("url")')
    sql = 'CREATE INDEX if not exists schema_name.visits_url_index ON visits (url collate cn asc) where id > 10;'
    expect(getParsedSql(sql)).to.be.equal('CREATE INDEX IF NOT EXISTS "schema_name"."visits_url_index" ON "visits" ("url" COLLATE cn ASC) WHERE "id" > 10')
  })
  it('should support constraint in create table', () => {
    const sql = `CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
        "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
        "ProductVersion" TEXT NOT NULL
    );`
    expect(getParsedSql(sql)).to.be.equal(`CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" ("MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY, "ProductVersion" TEXT NOT NULL)`)
  })

  it('should support INSERT ... RETURNING *', () => {
    let sql = `INSERT INTO users (email) VALUES (?) RETURNING *`
    expect(getParsedSql(sql)).to.be.equal(`INSERT INTO "users" (email) VALUES (?) RETURNING *`)
    sql = `INSERT INTO users VALUES (2, "example", "example@example.com") RETURNING *;`
    expect(getParsedSql(sql)).to.be.equal(`INSERT INTO "users" VALUES (2,"example","example@example.com") RETURNING *`)
  })
  it('should support INSERT ... RETURNING specific columns', () => {
    let sql = `INSERT INTO users (email) VALUES (?) RETURNING id, email as email_address`
    expect(getParsedSql(sql)).to.be.equal(`INSERT INTO "users" (email) VALUES (?) RETURNING "id", "email" AS "email_address"`)
    sql = `INSERT INTO users VALUES (2, "example", "example@example.com") RETURNING id, email;`
    expect(getParsedSql(sql)).to.be.equal(`INSERT INTO "users" VALUES (2,"example","example@example.com") RETURNING "id", "email"`)
  })
  it('should support UPDATE ... RETURNING *', () => {
    const sql = `UPDATE users SET email = ? RETURNING *`
    expect(getParsedSql(sql)).to.be.equal(`UPDATE "users" SET "email" = ? RETURNING *`)
  })
  it('should support UPDATE ... RETURNING specific columns', () => {
    const sql = `UPDATE users SET email = ? RETURNING id, email as email_address`
    expect(getParsedSql(sql)).to.be.equal(`UPDATE "users" SET "email" = ? RETURNING "id", "email" AS "email_address"`)
  })
  it('should support DELETE ... RETURNING *', () => {
    const sql = `DELETE FROM users WHERE last_login > ? RETURNING *`
    expect(getParsedSql(sql)).to.be.equal(`DELETE FROM "users" WHERE "last_login" > ? RETURNING *`)
  })
  it('should support DELETE ... RETURNING *', () => {
    const sql = `DELETE FROM users WHERE last_login > ? RETURNING id, email as email_address`
    expect(getParsedSql(sql)).to.be.equal(`DELETE FROM "users" WHERE "last_login" > ? RETURNING "id", "email" AS "email_address"`)
  })
  it('should support insert or replace', () => {
    const keywords = ['ABORT', 'FAIL', 'IGNORE', 'REPLACE', 'ROLLBACK']
    keywords.forEach(keyword => {
      const sql = `INSERT OR ${keyword} INTO test (category) VALUES ('Infra, Layer1, DePIN')`
      expect(getParsedSql(sql)).to.be.equal(`INSERT OR ${keyword} INTO "test" (category) VALUES ('Infra, Layer1, DePIN')`)
    })
  })
  it('should support LIKE with ESCAPE', () => {
    const sql = `SELECT * FROM table_name WHERE column_name LIKE '%pattern%' ESCAPE '\'`
    expect(getParsedSql(sql)).to.be.equal(`SELECT * FROM "table_name" WHERE "column_name" LIKE '%pattern%' ESCAPE '\'`)
  })
  it('should support string concatenation in LIKE opts', () => {
    const sql = `SELECT * FROM file WHERE path LIKE 'C:' || CHAR(92) || 'Users' || CHAR(92) || 'example.txt'`
    expect(getParsedSql(sql)).to.be.equal(`SELECT * FROM "file" WHERE "path" LIKE 'C:' || CHAR(92) || 'Users' || CHAR(92) || 'example.txt'`)
  })
  it('should support GROUP_CONCAT', () => {
    const sql = `SELECT
        CASE
            WHEN rs.url LIKE 'http://%' THEN SUBSTR(rs.url, 8, INSTR(SUBSTR(rs.url, 8), '/') - 1)
            WHEN rs.url LIKE 'https://%' THEN SUBSTR(rs.url, 9, INSTR(SUBSTR(rs.url, 9), '/') - 1)
            ELSE SUBSTR(rs.url, 1, INSTR(rs.url, '/') - 1)
        END AS domain,
        COUNT(*) AS total_citations,
        COUNT(DISTINCT mr.model_id) AS models_citing,
        COUNT(DISTINCT mr.response_id) AS responses_citing,
        GROUP_CONCAT(DISTINCT m.model_name) AS citing_models,
        AVG(mr.brand_visibility_score) AS avg_visibility_score,
        AVG(mr.recommendation_quality_score) AS avg_recommendation_quality
    FROM response_sources rs`
    expect(getParsedSql(sql)).to.be.equal(`SELECT CASE WHEN "rs"."url" LIKE 'http://%' THEN SUBSTR("rs"."url", 8, INSTR(SUBSTR("rs"."url", 8), '/') - 1) WHEN "rs"."url" LIKE 'https://%' THEN SUBSTR("rs"."url", 9, INSTR(SUBSTR("rs"."url", 9), '/') - 1) ELSE SUBSTR("rs"."url", 1, INSTR("rs"."url", '/') - 1) END AS "domain", COUNT(*) AS "total_citations", COUNT(DISTINCT "mr"."model_id") AS "models_citing", COUNT(DISTINCT "mr"."response_id") AS "responses_citing", GROUP_CONCAT(DISTINCT "m"."model_name") AS "citing_models", AVG("mr"."brand_visibility_score") AS "avg_visibility_score", AVG("mr"."recommendation_quality_score") AS "avg_recommendation_quality" FROM "response_sources" AS "rs"`)
  })
  it('should support bitwise operators', () => {
      const bitwiseOperators = ['&', '|', '<<', '>>']
      bitwiseOperators.forEach(operator => {
        const sql = `SELECT * FROM "table_name" WHERE "column_name" ${operator} 5 = 10`
        expect(getParsedSql(sql)).to.be.equal(sql)
      });
  });
})
