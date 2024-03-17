const { expect } = require('chai');
const Parser = require('../src/parser').default
const { selectIntoToSQL } = require('../src/select')

describe('mysql', () => {
  const parser = new Parser();
  function getParsedSql(sql, opt) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }
  const mariadb = { database: 'mariadb' }

  describe('select', () => {
    const SQL_LIST = [
      {
        title: 'basic regexp',
        sql: [
          "SELECT 'Michael!' REGEXP '.*';",
          "SELECT 'Michael!' REGEXP '.*'"
        ]
      },
      {
        title: 'basic regexp with newline',
        sql: [
          "SELECT 'new*\n*line' REGEXP 'new\\*.\\*line';",
          `SELECT 'new*\n*line' REGEXP 'new\\*.\\*line'`
        ]
      },
      {
        title: 'basic regexp with binary',
        sql: [
          "SELECT 'a' REGEXP '^[a-d]', 'a' REGEXP BINARY 'A';",
          "SELECT 'a' REGEXP '^[a-d]', 'a' REGEXP BINARY 'A'"
        ]
      },
      {
        title: 'regexp_instr',
        sql: [
          "SELECT REGEXP_INSTR('dog cat dog', 'dog');",
          "SELECT REGEXP_INSTR('dog cat dog', 'dog')"
        ]
      },
      {
        title: 'regexp_instr with pos',
        sql: [
          "SELECT REGEXP_INSTR('dog cat dog', 'dog', 2);",
          "SELECT REGEXP_INSTR('dog cat dog', 'dog', 2)"
        ]
      },
      {
        title: 'regexp_like',
        sql: [
          "SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE');",
          "SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE')"
        ]
      },
      {
        title: 'regexp_like with regex',
        sql: [
          "SELECT REGEXP_LIKE('fo\r\nfo', '^f.*$', 'm');",
          "SELECT REGEXP_LIKE('fo\r\nfo', '^f.*$', 'm')"
        ]
      },
      {
        title: 'regexp_like with collate',
        sql: [
          "SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE' COLLATE utf8mb4_0900_as_cs);",
          "SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE' COLLATE UTF8MB4_0900_AS_CS)"
        ]
      },
      {
        title: 'regexp_like with binary',
        sql: [
          "SELECT REGEXP_LIKE('a', 'A'), REGEXP_LIKE('a', BINARY 'A');",
          "SELECT REGEXP_LIKE('a', 'A'), REGEXP_LIKE('a', BINARY 'A')"
        ]
      },
      {
        title: 'regexp_replace',
        sql: [
          "SELECT REGEXP_REPLACE('abc def ghi', '[a-z]+', 'X', 1, 3);",
          "SELECT REGEXP_REPLACE('abc def ghi', '[a-z]+', 'X', 1, 3)"
        ]
      },
      {
        title: 'regexp_substr',
        sql: [
          "SELECT REGEXP_SUBSTR('abc def ghi', '[a-z]+', 1, 3);",
          "SELECT REGEXP_SUBSTR('abc def ghi', '[a-z]+', 1, 3)"
        ]
      },
      {
        title: 'window function',
        sql: [
          `SELECT
          store.NAME AS store,
          p1.date,
          sum( p1.show_num ) AS show_num,
          sum( p1.click_num ) AS click_num,
          round( sum( p1.click_num ) / sum( p1.show_num ), 4 ) AS click_rate,
          round( sum( p1.cost ) / sum( p1.click_num ), 2 ) AS cpc,
          round(
            sum( p1.cost ) / sum( p1.click_num ) * (
            sum( p1.click_num ) / sum( p1.show_num )) * 1000,
            2
          ) AS cpm,
          round( sum( p1.cost ) / sum( p1.add_cart_num ), 2 ) AS add_cart_cost,
          sum( p1.add_cart_num ) AS add_cart_num,
          round( sum( p1.add_cart_num ) / sum( p1.click_num ), 4 ) AS add_cart_rate,
          sum( p1.paid_order_num ) AS paid_order_num,
          round( sum( p1.cost ), 2 ) AS cost,
          round( sum( p1.paid_order_zmount ), 2 ) AS final_paid_order_amount,
          round( sum( sum( p1.cost )) over w, 2 ) AS cumulative_cost,
          round( sum( sum( p1.paid_order_zmount )) over w, 2 ) AS cumulative_final_paid_order_amount,
          round(( sum( sum( p1.paid_order_zmount )) over w )/( sum( sum( p1.cost )) over w ), 2 ) AS cumulative_roi,
          p3.second_day_paid_order_zmount AS second_day_paid_order_amount,
          round( p3.second_day_paid_order_zmount / sum( p1.cost ), 2 ) AS second_day_roi,
          round( sum( p1.paid_order_zmount )/ sum( p1.cost ), 2 ) AS final_roi
        FROM
          model_plangroup_15click AS p1
          LEFT JOIN (
          SELECT
            store,
            date,
            plan_group_name,
            max( upload_date ) AS max_upload_date
          FROM
            model_plangroup_15click
          WHERE
            model_plangroup_15click.upload_date IS NOT NULL
          GROUP BY
            store,
            date,
            plan_group_name
          ) AS p2 ON p1.store = p2.store
          AND p1.date = p2.date
          AND p1.plan_group_name = p2.plan_group_name
          AND p1.upload_date = p2.max_upload_date
          LEFT JOIN model_store AS store ON store.id = p1.store
          LEFT JOIN (
          SELECT
            p.store,
            p.date,
            round( sum( ifnull( paid_order_zmount, 0 )), 2 ) AS second_day_paid_order_zmount
          FROM
            model_plangroup_15click AS p
          WHERE
            DATEDIFF( p.upload_date, p.date ) = 1
          GROUP BY
            p.store,
            p.date
          ORDER BY
            p.store,
            p.date DESC
          ) AS p3 ON p1.store = p3.store
          AND p1.date = p3.date
        WHERE
          p2.max_upload_date IS NOT NULL
        GROUP BY
          p1.store,
          p1.date window w AS ( PARTITION BY p1.store, date_format( p1.date, "%Y%m" ) ORDER BY p1.date ROWS UNBOUNDED PRECEDING)
        ORDER BY
          p1.store,
          p1.date DESC`,
          'SELECT `store`.`NAME` AS `store`, `p1`.`date`, SUM(`p1`.`show_num`) AS `show_num`, SUM(`p1`.`click_num`) AS `click_num`, round(SUM(`p1`.`click_num`) / SUM(`p1`.`show_num`), 4) AS `click_rate`, round(SUM(`p1`.`cost`) / SUM(`p1`.`click_num`), 2) AS `cpc`, round(SUM(`p1`.`cost`) / SUM(`p1`.`click_num`) * (SUM(`p1`.`click_num`) / SUM(`p1`.`show_num`)) * 1000, 2) AS `cpm`, round(SUM(`p1`.`cost`) / SUM(`p1`.`add_cart_num`), 2) AS `add_cart_cost`, SUM(`p1`.`add_cart_num`) AS `add_cart_num`, round(SUM(`p1`.`add_cart_num`) / SUM(`p1`.`click_num`), 4) AS `add_cart_rate`, SUM(`p1`.`paid_order_num`) AS `paid_order_num`, round(SUM(`p1`.`cost`), 2) AS `cost`, round(SUM(`p1`.`paid_order_zmount`), 2) AS `final_paid_order_amount`, round(SUM(SUM(`p1`.`cost`)) OVER w, 2) AS `cumulative_cost`, round(SUM(SUM(`p1`.`paid_order_zmount`)) OVER w, 2) AS `cumulative_final_paid_order_amount`, round(SUM(SUM(`p1`.`paid_order_zmount`)) OVER w / SUM(SUM(`p1`.`cost`)) OVER w, 2) AS `cumulative_roi`, `p3`.`second_day_paid_order_zmount` AS `second_day_paid_order_amount`, round(`p3`.`second_day_paid_order_zmount` / SUM(`p1`.`cost`), 2) AS `second_day_roi`, round(SUM(`p1`.`paid_order_zmount`) / SUM(`p1`.`cost`), 2) AS `final_roi` FROM `model_plangroup_15click` AS `p1` LEFT JOIN (SELECT `store`, `date`, `plan_group_name`, MAX(`upload_date`) AS `max_upload_date` FROM `model_plangroup_15click` WHERE `model_plangroup_15click`.`upload_date` IS NOT NULL GROUP BY `store`, `date`, `plan_group_name`) AS `p2` ON `p1`.`store` = `p2`.`store` AND `p1`.`date` = `p2`.`date` AND `p1`.`plan_group_name` = `p2`.`plan_group_name` AND `p1`.`upload_date` = `p2`.`max_upload_date` LEFT JOIN `model_store` AS `store` ON `store`.`id` = `p1`.`store` LEFT JOIN (SELECT `p`.`store`, `p`.`date`, round(SUM(ifnull(`paid_order_zmount`, 0)), 2) AS `second_day_paid_order_zmount` FROM `model_plangroup_15click` AS `p` WHERE DATEDIFF(`p`.`upload_date`, `p`.`date`) = 1 GROUP BY `p`.`store`, `p`.`date` ORDER BY `p`.`store` ASC, `p`.`date` DESC) AS `p3` ON `p1`.`store` = `p3`.`store` AND `p1`.`date` = `p3`.`date` WHERE `p2`.`max_upload_date` IS NOT NULL GROUP BY `p1`.`store`, `p1`.`date` WINDOW w AS (PARTITION BY `p1`.`store`, date_format(`p1`.`date`, "%Y%m") ORDER BY `p1`.`date` ASC ROWS UNBOUNDED PRECEDING) ORDER BY `p1`.`store` ASC, `p1`.`date` DESC'
        ]
      },
      {
        title: 'on clause with function and expr',
        sql: [
          `select * from pg_database a
          join pg_database b
          on upper(a.datctype) = upper(b.datctype) AND a.oid = b.oid`,
          "SELECT * FROM `pg_database` AS `a` INNER JOIN `pg_database` AS `b` ON upper(`a`.`datctype`) = upper(`b`.`datctype`) AND `a`.`oid` = `b`.`oid`"
        ]
      },
      {
        title: 'trim function',
        sql: [
          `SELECT TRIM('.' from "....test.....") AS TrimmedString;`,
          'SELECT TRIM(\'.\' FROM "....test.....") AS `TrimmedString`'
        ]
      },
      {
        title: 'trim function with position',
        sql: [
          `SELECT TRIM(BOTH '.' from "....test.....") AS TrimmedString;`,
          'SELECT TRIM(BOTH \'.\' FROM "....test.....") AS `TrimmedString`'
        ]
      },
      {
        title: 'trim function with position',
        sql: [
          `SELECT TRIM(TRAILING  from " test ") AS TrimmedString;`,
          'SELECT TRIM(TRAILING FROM " test ") AS `TrimmedString`'
        ]
      },
      {
        title: 'trim function without config',
        sql: [
          `SELECT TRIM(" test ") AS TrimmedString;`,
          'SELECT TRIM(" test ") AS `TrimmedString`'
        ]
      },
      {
        title: 'column with start',
        sql: [
          `SELECT abc, * from tableName`,
          "SELECT `abc`, * FROM `tableName`"
        ]
      },
      {
        title: 'timestamp diff',
        sql: [
          'SELECT TIMESTAMPDIFF(SECOND,"2003-05-01 12:05:55","2003-05-01 12:06:32")',
          'SELECT TIMESTAMPDIFF(SECOND, "2003-05-01 12:05:55", "2003-05-01 12:06:32")'
        ],
      },
      {
        title: 'timestamp add',
        sql: [
          'SELECT TIMESTAMPADD(MINUTE,1,"2003-01-02")',
          'SELECT TIMESTAMPADD(MINUTE, 1, "2003-01-02")'
        ],
      },
      {
        title: 'create on update current_timestamp',
        sql: [
          "CREATE TABLE `t1` (`id` int(11) unsigned NOT NULL AUTO_INCREMENT, `name` varchar(64) NOT NULL DEFAULT 'ttt', `zf` int(10) unsigned zerofill DEFAULT NULL, `created_at` timestamp NULL DEFAULT now() on update now(), `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `last_modified_time` timestamp(4) NOT NULL DEFAULT '1970-01-01 00:00:00' ON UPDATE current_timestamp(4), PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 DATA DIRECTORY='/path/to/my/custom/directory';",
          "CREATE TABLE `t1` (`id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, `name` VARCHAR(64) NOT NULL DEFAULT 'ttt', `zf` INT(10) UNSIGNED ZEROFILL DEFAULT NULL, `created_at` TIMESTAMP NULL DEFAULT now() ON UPDATE NOW(), `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `last_modified_time` TIMESTAMP(4) NOT NULL DEFAULT '1970-01-01 00:00:00' ON UPDATE CURRENT_TIMESTAMP(4), PRIMARY KEY (`id`)) ENGINE = INNODB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 DATA DIRECTORY = '/path/to/my/custom/directory'"
        ],
      },
      {
        title: 'insert ignore into',
        sql: [
          "INSERT IGNORE INTO t1 (c1, c2) VALUES (1,1)",
          "INSERT IGNORE INTO `t1` (c1, c2) VALUES (1,1)"
        ],
      },
      {
        title: 'insert ignore into without columns',
        sql: [
          "INSERT IGNORE INTO t1 VALUES (1, 'hi')",
          "INSERT IGNORE INTO `t1` VALUES (1,'hi')"
        ],
      },
      {
        title: 'select into',
        sql: [
          "select c1, c2 into t1 from t2",
          "SELECT `c1`, `c2` INTO `t1` FROM `t2`"
        ],
      },
      {
        title: 'in bracket',
        sql: [
          "SELECT * FROM `tableName` WHERE POSITION('\n' IN `largeText`) > 0;",
          "SELECT * FROM `tableName` WHERE POSITION('\n' IN `largeText`) > 0"
        ],
      },
      {
        title: 'in bracket in column',
        sql: [
          "SELECT POSITION('\n' IN `largeText`) AS `charPosition` FROM `tableName`;",
          "SELECT POSITION('\n' IN `largeText`) AS `charPosition` FROM `tableName`"
        ],
      },
      {
        title: 'triple single quote',
        sql: [
          "select '''1'''",
          "SELECT '''1'''"
        ]
      },
      {
        title: 'rlike column',
        sql: [
          "select c1 from t1 where 'abc' rlike c2",
          "SELECT `c1` FROM `t1` WHERE 'abc' RLIKE `c2`"
        ]
      },
      {
        title: 'column with bracket',
        sql: [
          'SELECT `T`.`ddd` FROM `TABLE` AS `T`',
          'SELECT `T`.`ddd` FROM `TABLE` AS `T`'
        ]
      },
      {
        title: 'limit clause support ? as placeholder',
        sql: [
          'SELECT t0.xid, t0.xname FROM ORG_DEFINTION t0 WHERE (t0.xname = ?) LIMIT ?',
          'SELECT `t0`.`xid`, `t0`.`xname` FROM `ORG_DEFINTION` AS `t0` WHERE (`t0`.`xname` = ?) LIMIT ?'
        ]
      },
      {
        title: 'count distinct without parentheses',
        sql: [
          'SELECT COUNT(DISTINCT IF(active = 1, dep_id, NULL)) AS active_deps FROM users',
          'SELECT COUNT(DISTINCT IF(`active` = 1, `dep_id`, NULL)) AS `active_deps` FROM `users`'
        ]
      },
      {
        title: 'drop table if exists',
        sql: [
          'DROP TABLE IF EXISTS event_log',
          'DROP TABLE IF EXISTS `event_log`'
        ]
      },
      {
        title: 'sql column name wrapped by bracket',
        sql: [
          'SELECT `sometable`.`id` FROM sometable',
          'SELECT `sometable`.`id` FROM `sometable`'
        ]
      },
      {
        title: 'assigning a value to a sql variable within a select query',
        sql: [
          "SELECT @id := cust_id FROM customers WHERE cust_id='customer name';",
          "SELECT @id := `cust_id` FROM `customers` WHERE `cust_id` = 'customer name'"
        ]
      },
      {
        title: 'support hexadecimal literals',
        sql: [
          "SELECT X'4D7953514C', 0x01AF, x'01afd' from t1 where id = 0x1ecc96ce15;",
          "SELECT X'4D7953514C', 0x01AF, X'01afd' FROM `t1` WHERE `id` = 0x1ecc96ce15"
        ]
      },
      {
        title: 'alter table set auto_increment',
        sql: [
          'ALTER TABLE myTable AUTO_INCREMENT = 1;',
          'ALTER TABLE `myTable` AUTO_INCREMENT = 1'
        ]
      },
      {
        title: 'show create view',
        sql: [
          'SHOW CREATE VIEW abc.test',
          'SHOW CREATE VIEW `abc`.`test`'
        ]
      },
      {
        title: 'show create event',
        sql: [
          'SHOW CREATE EVENT `monthly_gc`',
          'SHOW CREATE EVENT `monthly_gc`'
        ]
      },
      {
        title: 'show create procedure',
        sql: [
          'SHOW CREATE PROCEDURE get_jails',
          'SHOW CREATE PROCEDURE `get_jails`'
        ]
      },
      {
        title: 'with',
        sql: [
          'WITH cte AS (SELECT id, ROW_NUMBER() OVER (PARTITION BY id, uid ORDER BY time DESC) ranking FROM t) SELECT id FROM cte WHERE ranking = 1',
          'WITH `cte` AS (SELECT `id`, ROW_NUMBER() OVER (PARTITION BY `id`, `uid` ORDER BY `time` DESC) AS `ranking` FROM `t`) SELECT `id` FROM `cte` WHERE `ranking` = 1'
        ]
      },
      {
        title: 'parentheses in from clause',
        sql: [
          'SELECT * FROM (user), (`name`)',
          'SELECT * FROM (`user`), (`name`)'
        ]
      },
      {
        title: 'blob data type',
        sql: [
          'CREATE TABLE `undo_log` (`id` bigint(20) NOT NULL AUTO_INCREMENT, `branch_id` bigint(20) NOT NULL, `xid` varchar(100) NOT NULL, `context` varchar(128) NOT NULL, `rollback_info` longblob NOT NULL, `log_status` int(11) NOT NULL, `log_created` datetime NOT NULL, `log_modified` datetime NOT NULL, `ext` varchar(100) DEFAULT NULL,PRIMARY KEY (`id` ASC) USING BTREE, UNIQUE KEY `ux_undo_log` (`xid` ASC, `branch_id` DESC) USING BTREE) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;',
          'CREATE TABLE `undo_log` (`id` BIGINT(20) NOT NULL AUTO_INCREMENT, `branch_id` BIGINT(20) NOT NULL, `xid` VARCHAR(100) NOT NULL, `context` VARCHAR(128) NOT NULL, `rollback_info` LONGBLOB NOT NULL, `log_status` INT(11) NOT NULL, `log_created` DATETIME NOT NULL, `log_modified` DATETIME NOT NULL, `ext` VARCHAR(100) DEFAULT NULL, PRIMARY KEY (`id` ASC) USING BTREE, UNIQUE KEY `ux_undo_log` (`xid` ASC, `branch_id` DESC) USING BTREE) ENGINE = INNODB DEFAULT CHARSET = utf8 ROW_FORMAT = DYNAMIC',
        ]
      },
      {
        title: 'positive number by plus sign',
        sql: [
          'select +5; select -5',
          'SELECT 5 ; SELECT -5'
        ]
      },
      {
        title: 'support xor operator',
        sql: [
          'SELECT (true xor false)',
          'SELECT (TRUE XOR FALSE)'
        ]
      },
      {
        title: 'logical operator without parentheses',
        sql: [
          'SELECT true OR false AND true;',
          'SELECT TRUE OR FALSE AND TRUE'
        ]
      },
      {
        title: 'logical operator in expr',
        sql: [
          'SELECT x>3 || x<9 && x=3;',
          'SELECT `x` > 3 || `x` < 9 && `x` = 3'
        ]
      },
      {
        title: 'escape double quoted',
        sql: [
          'SELECT "foo""bar" AS col;',
          'SELECT "foo""bar" AS `col`'
        ]
      },
      {
        title: 'escape quote',
        sql: [
          'SELECT * FROM t WHERE column1 = "foo\'bar"',
          'SELECT * FROM `t` WHERE `column1` = "foo\'bar"'
        ]
      },
      {
        title: 'escape bracket quoted',
        sql: [
          'SELECT `foo``bar`',
          'SELECT `foo``bar`'
        ]
      },
      {
        title: 'insert set statement without into',
        sql: [
          'insert t1 set c1 = 1',
          'INSERT `t1` SET `c1` = 1'
        ]
      },
      {
        title: 'support $ in alias ident',
        sql: [
          'select 1 as stuff$id from dual',
          'SELECT 1 AS `stuff$id` FROM DUAL',
        ]
      },
      {
        title: 'group concat with separator',
        sql: [
          "select GROUP_CONCAT(DISTINCT abc order by abc separator ';') as abc from business_table",
          "SELECT GROUP_CONCAT(DISTINCT `abc` ORDER BY `abc` ASC SEPARATOR ';') AS `abc` FROM `business_table`"
        ]
      },
      {
        title: 'group concat',
        sql: [
          `select
          (SELECT group_concat(v SEPARATOR ', ' )
          FROM category_table WHERE category = 3)
          AS category
          FROM fssa_esg_issues
          group by id`,
          "SELECT (SELECT GROUP_CONCAT(`v` SEPARATOR ', ') FROM `category_table` WHERE `category` = 3) AS `category` FROM `fssa_esg_issues` GROUP BY `id`",
        ]
      },
      {
        title: 'natural charset strings',
        sql: [
          "SELECT N'hello'",
          "SELECT N'hello'",
        ]
      },
      {
        title: '_latin1 string',
        sql: [
          "SELECT _latin1 x'AAFF00';",
          "SELECT _LATIN1 X'AAFF00'"
        ]
      },
      {
        title: 'binary string without x',
        sql: [
          "SELECT _binary 'hello';",
          "SELECT _BINARY 'hello'"
        ]
      },
      {
        title: 'geometry type',
        sql: [
          `CREATE TABLE \`GeoCoordinateTable\` (
            \`geoCoordinate\` point NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
          'CREATE TABLE `GeoCoordinateTable` (`geoCoordinate` POINT NOT NULL) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci'
        ]
      },
      {
        title: 'have clause with parentheses',
        sql: [
          `SELECT col1, col2
          FROM table1
          HAVING (col1 LIKE '%foo%' OR
                  col2 LIKE '%bar%')
             AND col1 <> 'test'`,
          "SELECT `col1`, `col2` FROM `table1` HAVING (`col1` LIKE '%foo%' OR `col2` LIKE '%bar%') AND `col1` <> 'test'"
        ]
      },
      {
        title: 'regexep right could be function call',
        sql: [
          `select
          (SELECT group_concat(v)
          FROM keyperson WHERE e.keyperson
          REGEXP concat('\b', k, '\b'))
          AS keyperson
          FROM abc e`,
          "SELECT (SELECT GROUP_CONCAT(`v`) FROM `keyperson` WHERE `e`.`keyperson` REGEXP concat('\b', `k`, '\b')) AS `keyperson` FROM `abc` AS `e`"
        ]
      },
      {
        title: 'set op UNION',
        sql: [
          `SELECT * FROM (SELECT 1) union SELECT * FROM (SELECT 2)`,
          'SELECT * FROM (SELECT 1) UNION SELECT * FROM (SELECT 2)'
        ]
      },
      {
        title: 'set op UNION ALL',
        sql: [
          `SELECT * FROM (SELECT 1) union all SELECT * FROM (SELECT 2)`,
          'SELECT * FROM (SELECT 1) UNION ALL SELECT * FROM (SELECT 2)'
        ]
      },
      {
        title: 'set op UNION DISTINCT',
        sql: [
          `SELECT * FROM (SELECT 1) union distinct SELECT * FROM (SELECT 2)`,
          'SELECT * FROM (SELECT 1) UNION DISTINCT SELECT * FROM (SELECT 2)'
        ]
      },
      {
        title: 'set op INTERSECT',
        sql: [
          `SELECT * FROM (SELECT 1) intersect SELECT * FROM (SELECT 2)`,
          'SELECT * FROM (SELECT 1) INTERSECT SELECT * FROM (SELECT 2)'
        ]
      },
      {
        title: 'set op minus',
        sql: [
          `SELECT * FROM (SELECT 1) minus SELECT * FROM (SELECT 2)`,
          'SELECT * FROM (SELECT 1) MINUS SELECT * FROM (SELECT 2)'
        ]
      },
      {
        title: 'index column length',
        sql: [
          'CREATE TABLE `Translation` (`id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,`en-GB` text,PRIMARY KEY (`id`),KEY `Translation_en-GB_btree_idx` (`en-GB`(768))) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci',
          'CREATE TABLE `Translation` (`id` CHAR(36) NOT NULL CHARACTER SET ASCII COLLATE ASCII_BIN, `en-GB` TEXT, PRIMARY KEY (`id`), KEY Translation_en-GB_btree_idx (`en-GB` (768))) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci',
        ]
      },
      {
        title: 'update after with clause',
        sql: [
          `with oops as (
            SELECT from_name,to_ccn, to_name
            from dolt_commit_diff_hospitals where from_commit = 'qtd6vb07pq7bfgt67m863anntm6fpu7n'
            and to_commit = 'p730obnbmihnlq54uvenck13h12f7831'
            and from_name <> to_name
            )
            update hospitals h
            join oops o
                on h.ccn = o.to_ccn
                and h.name <> o.from_name
            set h.name = o.from_name
          `,
          "WITH `oops` AS (SELECT `from_name`, `to_ccn`, `to_name` FROM `dolt_commit_diff_hospitals` WHERE `from_commit` = 'qtd6vb07pq7bfgt67m863anntm6fpu7n' AND `to_commit` = 'p730obnbmihnlq54uvenck13h12f7831' AND `from_name` <> `to_name`) UPDATE `hospitals` AS `h` INNER JOIN `oops` AS `o` ON `h`.`ccn` = `o`.`to_ccn` AND `h`.`name` <> `o`.`from_name` SET `h`.`name` = `o`.`from_name`"
        ]
      },
      {
        title: 'cross join',
        sql: [
          'select A.id,B.name from A CROSS JOIN B',
          'SELECT `A`.`id`, `B`.`name` FROM `A` CROSS JOIN `B`'
        ]
      },
      {
        title: 'case when list',
        sql: [
          `select A.id,B.name
          from A, B
          where
          CASE
              when A.id = 0 then B.name in ('aaa', 'bbb')
              when A.id = 1 then B.name in ('bbb', 'ccc')
              when A.id = 2 then B.name in ('ccc', 'ddd')
          end;`,
          "SELECT `A`.`id`, `B`.`name` FROM `A`, `B` WHERE CASE WHEN `A`.`id` = 0 THEN `B`.`name` IN ('aaa', 'bbb') WHEN `A`.`id` = 1 THEN `B`.`name` IN ('bbb', 'ccc') WHEN `A`.`id` = 2 THEN `B`.`name` IN ('ccc', 'ddd') END"
        ]
      },
      {
        title: 'drop database or schema stmt',
        sql: [
          'DROP DATABASE IF EXISTS dbName; drop schema abc',
          'DROP DATABASE IF EXISTS `dbName` ; DROP SCHEMA `abc`'
        ]
      },
      {
        title: 'create table with multiple data types',
        sql: [
          "CREATE TABLE `table_name` (`type_TINYINT` tinyint DEFAULT NULL, `type_SMALLINT` smallint DEFAULT NULL, `type_MEDIUMINT` mediumint DEFAULT NULL, `type_INT` int DEFAULT NULL, `type_BIGINT` bigint DEFAULT NULL, `type_FLOAT` float DEFAULT NULL, `type_DOUBLE` double DEFAULT NULL, `type_BIT` bit(1) DEFAULT NULL, `type_DATE` date DEFAULT NULL, `type_TIME` time DEFAULT NULL, `type_DATETIME` datetime DEFAULT NULL, `type_TIMESTAMP` timestamp NULL DEFAULT NULL, `type_YEAR` year DEFAULT NULL, `type_CHAR` char(10) DEFAULT NULL, `type_VARCHAR` varchar(255) DEFAULT NULL, `type_DECIMAL` decimal(10,2) DEFAULT NULL, `type_NUMERIC` decimal(10,2) DEFAULT NULL, `type_TINYTEXT` tinytext, `type_TEXT` text, `type_MEDIUMTEXT` mediumtext, `type_LONGTEXT` longtext, `type_ENUM` enum('A','B','C') DEFAULT NULL, `type_SET` set('A','B','C') DEFAULT NULL, `type_BINARY` binary(10) DEFAULT NULL, `type_VARBINARY` varbinary(255) DEFAULT NULL, `type_TINYBLOB` tinyblob, `type_BLOB` blob, `type_MEDIUMBLOB` mediumblob, `type_LONGBLOB` longblob) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
          "CREATE TABLE `table_name` (`type_TINYINT` TINYINT DEFAULT NULL, `type_SMALLINT` SMALLINT DEFAULT NULL, `type_MEDIUMINT` MEDIUMINT DEFAULT NULL, `type_INT` INT DEFAULT NULL, `type_BIGINT` BIGINT DEFAULT NULL, `type_FLOAT` FLOAT DEFAULT NULL, `type_DOUBLE` DOUBLE DEFAULT NULL, `type_BIT` BIT(1) DEFAULT NULL, `type_DATE` DATE DEFAULT NULL, `type_TIME` TIME DEFAULT NULL, `type_DATETIME` DATETIME DEFAULT NULL, `type_TIMESTAMP` TIMESTAMP NULL DEFAULT NULL, `type_YEAR` YEAR DEFAULT NULL, `type_CHAR` CHAR(10) DEFAULT NULL, `type_VARCHAR` VARCHAR(255) DEFAULT NULL, `type_DECIMAL` DECIMAL(10, 2) DEFAULT NULL, `type_NUMERIC` DECIMAL(10, 2) DEFAULT NULL, `type_TINYTEXT` TINYTEXT, `type_TEXT` TEXT, `type_MEDIUMTEXT` MEDIUMTEXT, `type_LONGTEXT` LONGTEXT, `type_ENUM` ENUM('A', 'B', 'C') DEFAULT NULL, `type_SET` SET('A', 'B', 'C') DEFAULT NULL, `type_BINARY` BINARY(10) DEFAULT NULL, `type_VARBINARY` VARBINARY(255) DEFAULT NULL, `type_TINYBLOB` TINYBLOB, `type_BLOB` BLOB, `type_MEDIUMBLOB` MEDIUMBLOB, `type_LONGBLOB` LONGBLOB) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci",
        ],
      },
      {
        title: 'remove type keyword',
        sql: [
          `ALTER TABLE test ADD
          type varchar(255) NOT NULL DEFAULT ('default');`,
          "ALTER TABLE `test` ADD `type` VARCHAR(255) NOT NULL DEFAULT ('default')"
        ]
      },
      {
        title: 'string concatenator in where clause',
        sql: [
          "SELECT * from tests where name = 'test' || 'abc';",
          "SELECT * FROM `tests` WHERE `name` = 'test' || 'abc'"
        ]
      },
      {
        title: 'show create table',
        sql: [
          'SHOW CREATE TABLE `debug`',
          'SHOW CREATE TABLE `debug`'
        ]
      },
      {
        title: 'drop view stmt',
        sql: [
          'drop view test_view cascade',
          'DROP VIEW `test_view` CASCADE'
        ]
      },
      {
        title: 'column name startswith "column"',
        sql: [
          'ALTER TABLE table_name ADD column4 varchar(255)',
          'ALTER TABLE `table_name` ADD `column4` VARCHAR(255)'
        ]
      },
      {
        title: 'convert number to data type',
        sql: [
          'select convert(150, char)',
          'SELECT CONVERT(150, CHAR)'
        ]
      },
      {
        title: 'convert func to data type',
        sql: [
          'SELECT CONVERT(SEC_TO_TIME(2378), TIME);',
          'SELECT CONVERT(SEC_TO_TIME(2378), TIME)'
        ]
      },
      {
        title: 'drop trigger',
        sql: [
          'drop trigger schema1.trigger1',
          'DROP TRIGGER `schema1`.`trigger1`'
        ]
      },
      {
        title: 'drop trigger if exists',
        sql: [
          'drop trigger if exists trigger1',
          'DROP TRIGGER IF EXISTS `trigger1`'
        ]
      },
      {
        title: 'create trigger',
        sql: [
          'create trigger trigger1 before update on merge for each row set NEW.updated_at = current_timestamp()',
          'CREATE TRIGGER `trigger1` BEFORE UPDATE ON `merge` FOR EACH ROW SET `NEW`.`updated_at` = CURRENT_TIMESTAMP()'
        ]
      },
      {
        title: 'create trigger with trigger order',
        sql: [
          'create trigger trigger1 before update on merge for each row  follows trigger2 set NEW.updated_at = current_timestamp()',
          'CREATE TRIGGER `trigger1` BEFORE UPDATE ON `merge` FOR EACH ROW FOLLOWS `trigger2` SET `NEW`.`updated_at` = CURRENT_TIMESTAMP()'
        ]
      },
      {
        title: 'show columns from table',
        sql: [
          'SHOW COLUMNS FROM table_name',
          'SHOW COLUMNS FROM `table_name`'
        ]
      },
      {
        title: 'show indexes from table',
        sql: [
          'SHOW INDEXES FROM table_name',
          'SHOW INDEXES FROM `table_name`'
        ]
      },
      {
        title: 'show triggers',
        sql: [
          'SHOW TRIGGERS',
          'SHOW TRIGGERS'
        ]
      },
      {
        title: 'show status',
        sql: [
          'SHOW PROCEDURE STATUS',
          'SHOW PROCEDURE STATUS'
        ]
      },
      {
        title: 'alter table modify column',
        sql: [
          "ALTER TABLE gifshow.reporter MODIFY Column update_at BIGINT UNSIGNED NOT NULL COMMENT 'update_at';",
          "ALTER TABLE `gifshow`.`reporter` MODIFY COLUMN `update_at` BIGINT UNSIGNED NOT NULL COMMENT 'update_at'"
        ]
      },
      {
        title: 'escape char patten matching',
        sql: [
          "select c1 from t1 where c2 like 'abc' escape '!'",
          "SELECT `c1` FROM `t1` WHERE `c2` LIKE 'abc' ESCAPE '!'"
        ]
      },
      {
        title: 'frac can be missing',
        sql: [
          'SELECT *, a*1., b FROM t',
          'SELECT *, `a` * 1, `b` FROM `t`'
        ]
      },
      {
        title: 'show tables',
        sql: [
          'show tables',
          'SHOW TABLES',
        ]
      },
      {
        title: 'create table with set dataType',
        sql: [
          "CREATE TABLE `users` (`id` int unsigned NOT NULL AUTO_INCREMENT, `name` varchar(20) DEFAULT NULL, `score` float DEFAULT '0', `coins` set('gold','silver','bronze','white','black') DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `name` (`name`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_c",
          "CREATE TABLE `users` (`id` INT UNSIGNED NOT NULL AUTO_INCREMENT, `name` VARCHAR(20) DEFAULT NULL, `score` FLOAT DEFAULT '0', `coins` SET('gold', 'silver', 'bronze', 'white', 'black') DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `name` (`name`)) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_c",
        ]
      },
      {
        title: 'nested subqueries',
        sql: [
          'select t.a,(select ( select POW(1 + 3, 2) from dual) from dual) from db.t',
          'SELECT `t`.`a`, (SELECT (SELECT POW(1 + 3, 2) FROM DUAL) FROM DUAL) FROM `db`.`t`'
        ]
      },
      {
        title: 'grant priv all',
        sql: [
          "GRANT ALL ON db1.* TO 'jeffrey'@'localhost';",
          "GRANT ALL ON `db1`.* TO 'jeffrey'@'localhost'"
        ]
      },
      {
        title: 'grant role',
        sql: [
          "GRANT 'role1', 'role2' TO 'user1'@'localhost', 'user2'@'localhost';",
          "GRANT 'role1', 'role2' TO 'user1'@'localhost', 'user2'@'localhost'"
        ]
      },
      {
        title: 'grant to role',
        sql: [
          "GRANT SELECT ON world.* TO 'role3';",
          "GRANT SELECT ON `world`.* TO 'role3'"
        ]
      },
      {
        title: 'grant priv type',
        sql: [
          "GRANT SELECT, INSERT ON mydb.* TO 'someuser'@'somehost';",
          "GRANT SELECT, INSERT ON `mydb`.* TO 'someuser'@'somehost'"
        ]
      },
      {
        title: 'grant priv type with columns',
        sql: [
          "GRANT SELECT (col1), INSERT (col1, col2) ON mydb.mytbl TO 'someuser'@'somehost';",
          "GRANT SELECT (`col1`), INSERT (`col1`, `col2`) ON `mydb`.`mytbl` TO 'someuser'@'somehost'"
        ]
      },
      {
        title: 'grant proxy',
        sql: [
          "GRANT PROXY ON 'localuser'@'localhost' TO 'externaluser'@'somehost';",
          "GRANT PROXY ON 'localuser'@'localhost' TO 'externaluser'@'somehost'"
        ]
      },
      {
        title: 'grant with option',
        sql: [
          "GRANT ALL ON *.* TO 'someuser'@'somehost' WITH GRANT OPTION",
          "GRANT ALL ON *.* TO 'someuser'@'somehost' WITH GRANT OPTION"
        ]
      },
      {
        title: 'convert using',
        sql: [
          `select convert(json_unquote(json_extract('{"thing": "252"}', "$.thing")) using utf8);`,
          `SELECT CONVERT(json_unquote(json_extract('{"thing": "252"}', "$.thing")) USING UTF8)`
        ]
      },
      {
        title: 'table option checksum and delay_key_write',
        sql: [
          'create table `users` (id int(11) not null) ENGINE=InnoDB AUTO_INCREMENT=10833 DEFAULT CHARSET=utf8 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC',
          'CREATE TABLE `users` (`id` INT(11) NOT NULL) ENGINE = INNODB AUTO_INCREMENT = 10833 DEFAULT CHARSET = utf8 CHECKSUM = 1 DELAY_KEY_WRITE = 1 ROW_FORMAT = DYNAMIC'
        ]
      },
      {
        title: 'column with db prefix',
        sql: [
          'SELECT d.t.* FROM d.t',
          'SELECT `d`.`t`.* FROM `d`.`t`'
        ]
      },
      {
        title: 'extract year-month',
        sql: [
          "SELECT EXTRACT(YEAR_MONTH FROM '2023-10-10')",
          "SELECT EXTRACT(YEAR_MONTH FROM '2023-10-10')"
        ]
      },
      {
        title: 'table name starts with number',
        sql: [
          'SELECT * FROM 2023t',
          'SELECT * FROM `2023t`'
        ]
      },
      {
        title: 'table name starts with lodash ignore keywords',
        sql: [
          'SELECT * FROM _rows',
          'SELECT * FROM `_rows`'
        ]
      },
      {
        title: 'insert ignore into',
        sql: [
          'INSERT IGNORE INTO tableName SET id=1',
          'INSERT IGNORE INTO `tableName` SET `id` = 1'
        ]
      },
      {
        title: 'expr in column',
        sql: [
          'SELECT col_1 = 0 AS is_admin FROM sample_table;',
          'SELECT `col_1` = 0 AS `is_admin` FROM `sample_table`'
        ]
      },
      {
        title: 'set column name is keyword',
        sql: [
          "UPDATE go_draw_type SET go=0, drawType=0, changeTag=(go_draw_type.changeTag + 1), modifiedAt='2023-11-09 20:27:47.735 UTC' WHERE (go_draw_type.id IN (405) AND (go_draw_type.uuid='1EE7DD91-2893-4296-A3C6-F7F5A62A134F' AND 1=1))",
          "UPDATE `go_draw_type` SET `go` = 0, `drawType` = 0, `changeTag` = (`go_draw_type`.`changeTag` + 1), `modifiedAt` = '2023-11-09 20:27:47.735 UTC' WHERE (`go_draw_type`.`id` IN (405) AND (`go_draw_type`.`uuid` = '1EE7DD91-2893-4296-A3C6-F7F5A62A134F' AND 1 = 1))"
        ]
      },
      {
        title: 'unary operator',
        sql: [
          'SELECT -foo > 0; SELECT +foo > 0; SELECT ~foo > 0; SELECT !1 > 0',
          'SELECT -`foo` > 0 ; SELECT +`foo` > 0 ; SELECT ~`foo` > 0 ; SELECT !1 > 0'
        ]
      },
      {
        title: 'like pattern',
        sql: [
          `SELECT
          *
        FROM
          test
        WHERE
          name LIKE :pattern COLLATE utf8mb4_general_ci`,
          'SELECT * FROM `test` WHERE `name` LIKE :pattern COLLATE UTF8MB4_GENERAL_CI'
        ]
      },
      {
        title: 'alter drop index',
        sql: [
          'ALTER TABLE table_name DROP INDEX index_name',
          'ALTER TABLE `table_name` DROP INDEX index_name'
        ]
      },
      {
        title: 'alter drop key',
        sql: [
          'ALTER TABLE table_name DROP key `key_name`',
          'ALTER TABLE `table_name` DROP KEY `key_name`'
        ]
      },
      {
        title: 'count args',
        sql: [
          'SELECT COUNT((A.col_1 = "03" AND A.col_2 ="") OR NULL) FROM sample_table A;',
          'SELECT COUNT((`A`.`col_1` = "03" AND `A`.`col_2` = "") OR NULL) FROM `sample_table` AS `A`'
        ]
      },
      {
        title: 'create user',
        sql: [
          "CREATE USER 'john'@'localhost' IDENTIFIED BY 'johnDoe1@'",
          "CREATE USER 'john'@'localhost' IDENTIFIED BY 'johnDoe1@'"
        ]
      },
      {
        title: 'cc',
        sql: [
          "CREATE USER 'joe'@'10.0.0.1' DEFAULT ROLE administrator, developer;",
          "CREATE USER 'joe'@'10.0.0.1' DEFAULT ROLE 'administrator', 'developer'"
        ]
      },
      {
        title: 'create user with password option',
        sql: [
          `CREATE USER 'jeffrey'@'localhost'
          IDENTIFIED WITH caching_sha2_password BY 'new_password'
          default role administrator, developer
          require ssl and x509
          with max_queries_per_hour 100
          PASSWORD EXPIRE INTERVAL 180 DAY
          FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 2 account lock comment 'test comment' attribute '{"fname": "James", "lname": "Scott", "phone": "123-456-7890"}';`,
          `CREATE USER 'jeffrey'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'new_password' DEFAULT ROLE 'administrator', 'developer' REQUIRE SSL AND X509 WITH MAX_QUERIES_PER_HOUR 100 PASSWORD EXPIRE INTERVAL 180 DAY FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 2 ACCOUNT LOCK COMMENT 'test comment' ATTRIBUTE '{"fname": "James", "lname": "Scott", "phone": "123-456-7890"}'`
        ]
      },
      {
        title: 'check constraint',
        sql: [
          'CREATE TABLE `table` (\n' +
          '`name` VARCHAR(255) CHECK(`name` LIKE \'ABC%\' AND LENGTH(`name`) >= 5)\n' +
          ');',
          "CREATE TABLE `table` (`name` VARCHAR(255) CHECK (`name` LIKE 'ABC%' AND LENGTH(`name`) >= 5))"
        ]
      },
      {
        title: 'show index',
        sql: [
          'show index from user',
          'SHOW INDEX FROM `user`'
        ]
      }
    ]
    SQL_LIST.forEach(sqlInfo => {
      const { title, sql } = sqlInfo
      it(`should support ${title}`, () => {
        expect(getParsedSql(sql[0])).to.equal(sql[1])
      })
      it(`should support ${title} in mariadb`, () => {
        expect(getParsedSql(sql[0], mariadb)).to.equal(sql[1])
      })
    })

    it('should throw error when args is not right', () => {
      let sql = `select convert(json_unquote(json_extract('{"thing": "252"}', "$.thing")));`
      expect(parser.astify.bind(parser, sql)).to.throw('Expected "!=", "#", "%", "&", "&&", "*", "+", ",", "-", "--", "/", "/*", "<", "<<", "<=", "<>", "=", ">", ">=", ">>", "AND", "BETWEEN", "IN", "IS", "LIKE", "NOT", "ON", "OR", "OVER", "REGEXP", "RLIKE", "USING", "XOR", "^", "div", "|", "||", or [ \\t\\n\\r] but ")" found.')
      expect(parser.astify.bind(parser, 'select convert("");')).to.throw('Expected "!=", "#", "%", "&", "&&", "*", "+", ",", "-", "--", "/", "/*", "<", "<<", "<=", "<>", "=", ">", ">=", ">>", "AND", "BETWEEN", "COLLATE", "IN", "IS", "LIKE", "NOT", "OR", "REGEXP", "RLIKE", "USING", "XOR", "^", "div", "|", "||", or [ \\t\\n\\r] but ")" found.')
      sql = 'SELECT AVG(Quantity,age) FROM table1;'
      expect(parser.astify.bind(parser, sql)).to.throw('Expected "#", "%", "&", "(", ")", "*", "+", "-", "--", "->", "->>", ".", "/", "/*", "<<", ">>", "^", "div", "|", "||", [ \\t\\n\\r], [A-Za-z0-9_$\\x80-￿], or [A-Za-z0-9_:] but "," found.')
    })

    it('should join multiple table with comma', () => {
      const sql = 'SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id, t3 AS tbl'
      let ast = parser.astify(sql)
      const tbl = { db: null, table: 't3', as: 'tbl' }
      const backSQL = 'SELECT * FROM `t1` INNER JOIN `t2` ON `t1`.`id` = `t2`.`id`, `t3` AS `tbl`'
      expect(ast.from[2]).to.be.eql(tbl)
      expect(parser.sqlify(ast)).to.be.equal(backSQL)
      ast = parser.astify(sql, mariadb)
      expect(ast.from[2]).to.be.eql(tbl)
      expect(parser.sqlify(ast, mariadb)).to.be.equal(backSQL)
    })

    it('should have spaces between keywords', () => {
      const sql = 'CREATE TABLE `foo` (`id` int UNIQUEKEYONUPDATECASCADE)'
      expect(parser.astify.bind(parser, sql)).to.throw('Expected "#", ")", ",", "--", "/*", "AS", "AUTO_INCREMENT", "CHARACTER", "CHECK", "COLLATE", "COLUMN_FORMAT", "COMMENT", "CONSTRAINT", "DEFAULT", "GENERATED", "KEY", "NOT NULL", "NULL", "PRIMARY", "REFERENCES", "STORAGE", "UNIQUE", or [ \\t\\n\\r] but "O" found.')
      expect(parser.astify.bind(parser, sql, mariadb)).to.throw('Expected "#", ")", ",", "--", "/*", "AUTO_INCREMENT", "CHARACTER", "CHECK", "COLLATE", "COLUMN_FORMAT", "COMMENT", "CONSTRAINT", "DEFAULT", "KEY", "NOT NULL", "NULL", "PRIMARY", "REFERENCES", "STORAGE", "UNIQUE", or [ \\t\\n\\r] but "O" found.')
    })

    describe('column clause', () => {
      it('should support fulltext search', () => {
        const sqlList = [
          'SELECT MATCH (`label`) AGAINST (?) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT MATCH (`label`) AGAINST (?) AS `score`, MATCH (`id`, `name`) AGAINST (?) FROM `TABLE` ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` WHERE MATCH (`label`) AGAINST (?) > 0 ORDER BY `label` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (?) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT MATCH (`label`) AGAINST (?) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (?) > 0 ORDER BY `score` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (?) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (?) > 0 ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` ORDER BY MATCH (`label`) AGAINST (?) DESC',
          'SELECT MATCH (`label`) AGAINST (? IN BOOLEAN MODE) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN BOOLEAN MODE) > 0 ORDER BY `label` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (? IN BOOLEAN MODE) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT MATCH (`label`) AGAINST (? IN BOOLEAN MODE) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN BOOLEAN MODE) > 0 ORDER BY `score` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (? IN BOOLEAN MODE) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN BOOLEAN MODE) > 0 ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` ORDER BY MATCH (`label`) AGAINST (? IN BOOLEAN MODE) DESC',
          'SELECT MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE) > 0 ORDER BY `label` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE) > 0 ORDER BY `score` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE) > 0 ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` ORDER BY MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE) DESC',
          'SELECT MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION) > 0 ORDER BY `label` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION) > 0 ORDER BY `score` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION) > 0 ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` ORDER BY MATCH (`label`) AGAINST (? IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION) DESC',
          'SELECT MATCH (`label`) AGAINST (? WITH QUERY EXPANSION) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? WITH QUERY EXPANSION) > 0 ORDER BY `label` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (? WITH QUERY EXPANSION) AS `score` FROM `TABLE` ORDER BY `score` DESC',
          'SELECT MATCH (`label`) AGAINST (? WITH QUERY EXPANSION) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? WITH QUERY EXPANSION) > 0 ORDER BY `score` DESC',
          'SELECT `label`, MATCH (`label`) AGAINST (? WITH QUERY EXPANSION) AS `score` FROM `TABLE` WHERE MATCH (`label`) AGAINST (? WITH QUERY EXPANSION) > 0 ORDER BY `score` DESC',
          'SELECT `label` FROM `TABLE` ORDER BY MATCH (`label`) AGAINST (? WITH QUERY EXPANSION) DESC',
        ]
        sqlList.forEach(sql => {
          expect(getParsedSql(sql)).to.equal(sql)
          expect(getParsedSql(sql, mariadb)).to.equal(sql)
        })
      })

      it('should throw error when colum is select stmt', () => {
        let sql = 'select\nselect * from test_table'
        let fun = parser.astify.bind(parser, sql)
        expect(fun).to.throw('invalid column clause with select statement')
        sql = 'select\nselect * from test_table and \nselect * from test_table2'
        fun = parser.astify.bind(parser, sql)
        expect(fun).to.throw('invalid column clause with select statement')
      })

      it('should support bit function and operators', () => {
        const sqlList = [
          'SELECT 127 | 128, 128 << 2, BIT_COUNT(15)',
          `SELECT '127' | '128', '128' << 2, BIT_COUNT('15')`,
          `SELECT X'7F' | X'80', X'80' << 2, BIT_COUNT(X'0F')`,
          `SELECT HEX(UUID_TO_BIN('6ccd780c-baba-1026-9564-5b8c656024db'))`,
          `SELECT HEX(INET6_ATON('fe80::219:d1ff:fe91:1a72'))`,
          `SELECT X'40' | X'01', b'11110001' & b'01001111'`,
          `SELECT _BINARY X'40' | X'01', b'11110001' & _BINARY b'01001111'`,
          `SELECT _BINARY X'4040404040404040' | X'0102030405060708'`,
          `SELECT 64 | 1, X'40' | X'01'`,
        ]
        sqlList.forEach(sql => {
          expect(getParsedSql(sql)).to.equal(sql)
          expect(getParsedSql(sql, mariadb)).to.equal(sql)
        })
      })
    })

    describe('into', () => {
      it('should support select into variables', () => {
        let sql = 'SELECT * INTO @myvar FROM t1;'
        let parsedSQL = 'SELECT * INTO @myvar FROM `t1`'
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
        sql = 'SELECT * FROM t1 INTO @myvar FOR UPDATE;'
        parsedSQL = 'SELECT * FROM `t1` INTO @myvar FOR UPDATE'
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
        sql = 'SELECT * FROM t1 FOR UPDATE INTO @myvar;'
        parsedSQL = 'SELECT * FROM `t1` FOR UPDATE INTO @myvar'
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
        sql = 'SELECT id, data INTO @x, @y FROM test.t1 LIMIT 1;'
        parsedSQL = 'SELECT `id`, `data` INTO @x, @y FROM `test`.`t1` LIMIT 1'
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
      })

      it('should support select into outfile', () => {
        const sql = `SELECT * FROM (VALUES ROW(1,2,3),ROW(4,5,6),ROW(7,8,9)) AS t
        INTO OUTFILE '/tmp/select-values.txt';`
        const parsedSQL = "SELECT * FROM (VALUES ROW(1,2,3), ROW(4,5,6), ROW(7,8,9)) AS `t` INTO OUTFILE '/tmp/select-values.txt'"
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
      })

      it('should support select into dumpfile', () => {
        const sql = `SELECT * FROM (VALUES ROW(1,2,3),ROW(4,5,6),ROW(7,8,9)) AS t
        INTO DUMPFILE '/tmp/select-values.txt';`
        const parsedSQL = "SELECT * FROM (VALUES ROW(1,2,3), ROW(4,5,6), ROW(7,8,9)) AS `t` INTO DUMPFILE '/tmp/select-values.txt'"
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
      })

      it('should return empty when into is null', () => {
        expect(selectIntoToSQL()).to.be.undefined
        expect(selectIntoToSQL({})).to.be.undefined
      })
    })
  })

})