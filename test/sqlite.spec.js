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
    expect(getParsedSql(sql)).to.be.equal('ANALYZE `schemaName`.`tableName`')
  })

  it('should support attach', () => {
    const sql = "attach database 'c:\sqlite\db\contacts.db' as contacts;"
    expect(getParsedSql(sql)).to.be.equal("ATTACH DATABASE 'c:\sqlite\db\contacts.db' AS `contacts`")
  })

  it('should support json function in from clause', () => {
    const sql = `SELECT json_extract(value, '$.id') AS author_id
    FROM
        post,
        json_each(post.author, '$')
    GROUP BY
        author_id;`
    expect(getParsedSql(sql)).to.be.equal("SELECT json_extract(`value`, '$.id') AS `author_id` FROM `post`, json_each(`post`.`author`, '$') GROUP BY `author_id`")
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
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM `pets` LEFT JOIN (SELECT * FROM `user` WHERE `user`.`name` = "pepe" || "rone") AS `u` ON `pets`.`owner` = `u`.`id` GROUP BY `pets`.`id`')
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
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM `pets` LEFT JOIN (SELECT * FROM `user` WHERE `user`.`code` = UPPER("test") OR `user`.`name` = "pepe") AS `u` ON `pets`.`owner` = `u`.`id` GROUP BY `pets`.`id`')
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
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM `pets` LEFT JOIN (SELECT * FROM `user` WHERE `user`.`name` = "pepe" || "rone" OR `user`.`code` = UPPER("test") OR `user`.`code` = UPPER("more_test")) AS `u` ON `pets`.`owner` = `u`.`id` GROUP BY `pets`.`id`')
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
    expect(getParsedSql(sql)).to.be.equal("SELECT `id`, json_object('hasGeometry', CASE WHEN json_extract(`floor`.`rect`, '$') IS '{\"boundariesList\":[]}' THEN json('false') ELSE json('true') END) AS `metadata` FROM `floor` WHERE `floor`.`id` = 1")
  })

  it('should support glob operator', () => {
    const sql = "SELECT device.id FROM device WHERE device.model GLOB '*XYZ';"
    expect(getParsedSql(sql)).to.be.equal("SELECT `device`.`id` FROM `device` WHERE `device`.`model` GLOB '*XYZ'")
  })

  it('should support create table...as', () => {
    const sql = `CREATE TABLE IF NOT EXISTS stg_devices AS SELECT * FROM devices WHERE 1 = 0;`
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE IF NOT EXISTS `stg_devices` AS SELECT * FROM `devices` WHERE 1 = 0')
  })

  it('should support escape single quote', () => {
    const sql = "SELECT name, 'doesn''t smoke' FROM people WHERE name = 'John';"
    expect(getParsedSql(sql)).to.be.equal("SELECT `name`, 'doesn''t smoke' FROM `people` WHERE `name` = 'John'")
  })

  it('should support create with autoincrement, boolean type and definition could be empty', () => {
    let sql = 'CREATE TABLE `foobar1` (`id` integer not null primary key autoincrement, `name` varchar(255), `batch` boolean, `migration_time` datetime)'
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE `foobar1` (`id` INTEGER NOT NULL AUTOINCREMENT PRIMARY KEY, `name` VARCHAR(255), `batch` BOOLEAN, `migration_time` DATETIME)')
    sql = 'CREATE TABLE sqlite_stat4(tbl,idx,neq,nlt,ndlt,sample)'
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE `sqlite_stat4` (`tbl`, `idx`, `neq`, `nlt`, `ndlt`, `sample`)')
  })

  it('should support with clause table name', () => {
    const sql = 'with `e` as (select * from employees) SELECT name,`e`.`hired_on` FROM `e`'
    expect(getParsedSql(sql)).to.be.equal('WITH `e` AS (SELECT * FROM `employees`) SELECT `name`, `e`.`hired_on` FROM `e`')
  })

  it('should support blob type', () => {
    const sql = `CREATE TABLE "session_caches" (
      "service_name"	TEXT NOT NULL,
      "session_data"	BLOB NOT NULL,
      "expires_at"	INTEGER,
      PRIMARY KEY("service_name","expires_at")
    )`
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE `session_caches` (`service_name` TEXT NOT NULL, `session_data` BLOB NOT NULL, `expires_at` INTEGER, PRIMARY KEY (`service_name`, `expires_at`))')
  })
  it('should support missing number after dot in number', () => {
    const sql = 'select count(*)*1. from abc'
    expect(getParsedSql(sql)).to.be.equal('SELECT COUNT(*) * 1 FROM `abc`')
  })
  it('should support create trigger', () => {
    let sql = `CREATE TRIGGER update_customer_address UPDATE OF address ON customers
    BEGIN
      UPDATE orders SET address = new.address WHERE customer_name = old.name;
    END;`
    expect(getParsedSql(sql)).to.be.equal('CREATE TRIGGER `update_customer_address` UPDATE OF `address` ON `customers` BEGIN UPDATE `orders` SET `address` = `new`.`address` WHERE `customer_name` = `old`.`name` END')
  })

  it('should support union', () => {
    let sql = `SELECT * FROM a UNION SELECT * FROM b`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM `a` UNION SELECT * FROM `b`')

    sql = `SELECT * FROM a UNION ALL SELECT * FROM b`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM `a` UNION ALL SELECT * FROM `b`')

    sql = `SELECT * FROM a UNION DISTINCT SELECT * FROM b`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM `a` UNION DISTINCT SELECT * FROM `b`')
  })

  it('should support keyword as column name in create table sql', () => {
    const sql = 'CREATE TABLE IF NOT EXISTS "Test" (Id INTEGER NOT NULL PRIMARY KEY UNIQUE, like TEXT NOT NULL, Difficulty TEXT, percent real, PRIMARY KEY(Id));'
    expect(getParsedSql(sql)).to.be.equal('CREATE TABLE IF NOT EXISTS `Test` (`Id` INTEGER NOT NULL PRIMARY KEY UNIQUE, `like` TEXT NOT NULL, `Difficulty` TEXT, `percent` REAL, PRIMARY KEY (`Id`))')
  })

  it('should support sqlify autoincrement to other db', () => {
    let sql = 'CREATE TABLE IF NOT EXISTS "SampleTable" ( "ID" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT UNIQUE, "Name" TEXT NOT NULL);'
    let ast = parser.astify(sql, DEFAULT_OPT)
    expect(parser.sqlify(ast, { database: 'mariadb'})).to.be.equal('CREATE TABLE IF NOT EXISTS `SampleTable` (`ID` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY UNIQUE, `Name` TEXT NOT NULL)')
    sql = ' CREATE TABLE `Test` (  `id` int(11) NOT NULL,  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,  PRIMARY KEY (`id`),  UNIQUE KEY `name` (`name`));'
    ast = parser.astify(sql, { database: 'mariadb' })
    expect(parser.sqlify(ast, DEFAULT_OPT)).to.be.equal('CREATE TABLE `Test` (`id` INT(11) NOT NULL, `name` VARCHAR(255) NOT NULL, PRIMARY KEY (`id`), UNIQUE (`name`))')
  })

  it('should support create view', () => {
    let sql = 'create view v1 as select * from t1'
    expect(getParsedSql(sql)).to.be.equal('CREATE VIEW `v1` AS SELECT * FROM `t1`')
    sql = 'create temp view if not exists s.v1(a, b, c) as select * from t1'
    expect(getParsedSql(sql)).to.be.equal('CREATE TEMP VIEW IF NOT EXISTS `s`.`v1` (`a`, `b`, `c`) AS SELECT * FROM `t1`')
  })
})
