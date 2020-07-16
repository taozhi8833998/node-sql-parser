const { expect } = require('chai');
const Parser = require('../src/parser').default
const { indexOptionToSQL, indexTypeAndOptionToSQL } = require('../src/index-definition')
const { columnOrderListToSQL } = require('../src/util')

describe('create', () => {
  const parser = new Parser();
  const DEFAULT_OPT = {
    database: 'mysql'
  }

  function getParsedSql(sql, opt = DEFAULT_OPT) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  describe('create table with basic', () => {
    it('should support create table', () => {
      expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128))`))
        .to.equal('CREATE TEMPORARY TABLE `dbname`.`tableName` (`id` INT, `name` VARCHAR(128))');
      expect(getParsedSql(`create temporary table dbname.tableName (id int not null default 1, name varchar(128) null default "xx")`))
        .to.equal('CREATE TEMPORARY TABLE `dbname`.`tableName` (`id` INT NOT NULL DEFAULT 1, `name` VARCHAR(128) NULL DEFAULT \'xx\')');
      expect(getParsedSql(`create table dbname.tableName (id INT(11) primary key) ENGINE = MEMORY default character SET = utf8 comment = 'comment test'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11) PRIMARY KEY) ENGINE = MEMORY DEFAULT CHARACTER SET = utf8 COMMENT = \'comment test\'');
      expect(getParsedSql(`create table dbname.tableName (id decimal(11, 2) primary key) ENGINE = MEMORY default charset = utf8 comment = 'comment test'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` DECIMAL(11, 2) PRIMARY KEY) ENGINE = MEMORY DEFAULT CHARSET = utf8 COMMENT = \'comment test\'');
      expect(getParsedSql(`create table dbname.tableName (id INT(11) primary key) ENGINE = MEMORY default charset = utf8 comment = 'comment test'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11) PRIMARY KEY) ENGINE = MEMORY DEFAULT CHARSET = utf8 COMMENT = \'comment test\'');
      expect(getParsedSql('CREATE TABLE `Person` ( `id_Person` int(10) unsigned NOT NULL AUTO_INCREMENT, `id_person_gender` int(11) unsigned zerofill NOT NULL, `id_person_origin` int(11) zerofill NOT NULL, `age` int(11) NOT NULL, `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `is_alive` tinyint(1) DEFAULT NULL, `updated_by` varchar(48) DEFAULT NULL, PRIMARY KEY (`id_Person`), UNIQUE KEY `pft_ge_or` (`id_person_gender`, `id_person_origin`) );'))
        .to.equal('CREATE TABLE `Person` (`id_Person` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, `id_person_gender` INT(11) UNSIGNED ZEROFILL NOT NULL, `id_person_origin` INT(11) ZEROFILL NOT NULL, `age` INT(11) NOT NULL, `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `is_alive` TINYINT(1) DEFAULT NULL, `updated_by` VARCHAR(48) DEFAULT NULL, PRIMARY KEY (`id_Person`), UNIQUE KEY `pft_ge_or` (`id_person_gender`, `id_person_origin`))');
      expect(getParsedSql(`create table dbname.tableName (id INT(11) primary key, name varchar(128) unique key) ENGINE = MEMORY compression = 'zlib'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11) PRIMARY KEY, `name` VARCHAR(128) UNIQUE KEY) ENGINE = MEMORY COMPRESSION = \'ZLIB\'');
      expect(getParsedSql(`create table dbname.tableName (id INT(11), name varchar(128), primary key(id)) ENGINE = MEMORY compression = 'zlib'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11), `name` VARCHAR(128), PRIMARY KEY (`id`)) ENGINE = MEMORY COMPRESSION = \'ZLIB\'');
      expect(getParsedSql(`create table dbname.tableName (id BIGINT(11), name varchar(128), primary key(id)) ENGINE = MEMORY compression = 'zlib'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` BIGINT(11), `name` VARCHAR(128), PRIMARY KEY (`id`)) ENGINE = MEMORY COMPRESSION = \'ZLIB\'');
      expect(getParsedSql(`create table dbname.tableName (id INT(11), name varchar(128), update_time timestamp not null default current_timestamp ON update current_timestamp, primary key(id)) ENGINE = MEMORY compression = 'zlib'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11), `name` VARCHAR(128), `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (`id`)) ENGINE = MEMORY COMPRESSION = \'ZLIB\'');
      expect(getParsedSql(`create table dbname.tableName (id INT(11), name text not null, mt mediumtext not null, lt longtext, tt tinytext, primary key(id)) ENGINE = MEMORY compression = 'zlib'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11), `name` TEXT NOT NULL, `mt` MEDIUMTEXT NOT NULL, `lt` LONGTEXT, `tt` TINYTEXT, PRIMARY KEY (`id`)) ENGINE = MEMORY COMPRESSION = \'ZLIB\'');
      expect(getParsedSql(`create table dbname.tableName (id INT(11), float_a FLOAT not null, double_b DOUBLE, decimal_c DECIMAL (6,5), float_m float(7), float_md float(7,4), double_m double(6), double_md double(6, 3),primary key(id)) ENGINE = MEMORY compression = 'zlib'`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11), `float_a` FLOAT NOT NULL, `double_b` DOUBLE, `decimal_c` DECIMAL(6, 5), `float_m` FLOAT(7), `float_md` FLOAT(7, 4), `double_m` DOUBLE(6), `double_md` DOUBLE(6, 3), PRIMARY KEY (`id`)) ENGINE = MEMORY COMPRESSION = \'ZLIB\'');
    })

    it('should support create temporary table', () => {
      expect(getParsedSql(`create temporary table dbname.tableName (id INT primary key) ENGINE = MEMORY min_rows 10 max_rows 100`))
        .to.equal('CREATE TEMPORARY TABLE `dbname`.`tableName` (`id` INT PRIMARY KEY) ENGINE = MEMORY MIN_ROWS 10 MAX_ROWS 100');
    })

    it('should support create if not exists table', () => {
      expect(getParsedSql(`create table if not exists dbname.tableName (id INT(11) primary key) ENGINE = MEMORY`))
        .to.equal('CREATE TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) PRIMARY KEY) ENGINE = MEMORY');
    })

    it('should support create temporary if not exists table', () => {
      expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) primary key) ENGINE = MEMORY`))
        .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) PRIMARY KEY) ENGINE = MEMORY');
    })

    describe('column definition options', () => {
      it('should support create table with auto_increment', () => {
        expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) auto_increment primary key) ENGINE = MEMORY`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) AUTO_INCREMENT PRIMARY KEY) ENGINE = MEMORY');
      })

      it('should support create table with engine', () => {
        expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) auto_increment primary key) ENGINE = innodb`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) AUTO_INCREMENT PRIMARY KEY) ENGINE = INNODB');
      })

      it('should support create table with comment', () => {
        expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) auto_increment primary key comment "id column", name varchar(128) unique key comment "user name") ENGINE = MEMORY`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) AUTO_INCREMENT PRIMARY KEY COMMENT \'id column\', `name` VARCHAR(128) UNIQUE KEY COMMENT \'user name\') ENGINE = MEMORY');
      })

      it('should support create table with collate', () => {
        expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) auto_increment primary key comment "id column" collate utf8_bin, name varchar(128) unique key comment "user name" collate utf8_bin) ENGINE = MEMORY`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) AUTO_INCREMENT PRIMARY KEY COMMENT \'id column\' COLLATE UTF8_BIN, `name` VARCHAR(128) UNIQUE KEY COMMENT \'user name\' COLLATE UTF8_BIN) ENGINE = MEMORY');
      })

      it('should support create table with collate', () => {
        expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) auto_increment primary key comment "id column" collate utf8_bin, name varchar(128) unique key comment "user name" collate utf8_bin) ENGINE = MEMORY`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) AUTO_INCREMENT PRIMARY KEY COMMENT \'id column\' COLLATE UTF8_BIN, `name` VARCHAR(128) UNIQUE KEY COMMENT \'user name\' COLLATE UTF8_BIN) ENGINE = MEMORY');
      })

      it('should support create table with column_format', () => {
        expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) auto_increment primary key comment "id column" collate utf8_bin column_format fixed, name varchar(128) unique key comment "user name" collate utf8_bin column_format dynamic) ENGINE = MEMORY`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) AUTO_INCREMENT PRIMARY KEY COMMENT \'id column\' COLLATE UTF8_BIN COLUMN_FORMAT FIXED, `name` VARCHAR(128) UNIQUE KEY COMMENT \'user name\' COLLATE UTF8_BIN COLUMN_FORMAT DYNAMIC) ENGINE = MEMORY');
      })

      it('should support create table with storage', () => {
        expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) auto_increment primary key comment "id column" collate utf8_bin column_format fixed storage disk, name varchar(128) unique key comment "user name" collate utf8_bin column_format dynamic storage memory) ENGINE = MEMORY`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) AUTO_INCREMENT PRIMARY KEY COMMENT \'id column\' COLLATE UTF8_BIN COLUMN_FORMAT FIXED STORAGE DISK, `name` VARCHAR(128) UNIQUE KEY COMMENT \'user name\' COLLATE UTF8_BIN COLUMN_FORMAT DYNAMIC STORAGE MEMORY) ENGINE = MEMORY');
      })

      it('should support create table with reference definition', () => {
        expect(getParsedSql(`create temporary table if not exists dbname.tableName (id INT(11) auto_increment primary key comment "id column" collate utf8_bin column_format fixed storage disk references rdb.rta(id) match full on delete cascade on update restrict, name varchar(128) unique key comment "user name" collate utf8_bin column_format dynamic storage memory references rdb.rtb(name) match simple on delete set null on update set default) ENGINE = MEMORY`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT(11) AUTO_INCREMENT PRIMARY KEY COMMENT \'id column\' COLLATE UTF8_BIN COLUMN_FORMAT FIXED STORAGE DISK REFERENCES `rdb`.`rta` (`id`) MATCH FULL ON DELETE CASCADE ON UPDATE RESTRICT, `name` VARCHAR(128) UNIQUE KEY COMMENT \'user name\' COLLATE UTF8_BIN COLUMN_FORMAT DYNAMIC STORAGE MEMORY REFERENCES `rdb`.`rtb` (`name`) MATCH SIMPLE ON DELETE SET NULL ON UPDATE SET DEFAULT) ENGINE = MEMORY');
      })

    })

    describe('create index or key', () => {
      ['index', 'key'].forEach(type => {
        it(`should support create table ${type}`, () => {
          expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} idx_name using hash (name) key_block_size 128) engine = innodb auto_increment = 10`))
            .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} idx_name USING HASH (\`name\`) KEY_BLOCK_SIZE 128) ENGINE = INNODB AUTO_INCREMENT = 10`);

          expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} using btree (name) key_block_size = 128 visible)`))
            .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} USING BTREE (\`name\`) KEY_BLOCK_SIZE = 128 VISIBLE)`);

          expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} using btree (name) key_block_size = 128 visible with parser newparser)`))
            .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} USING BTREE (\`name\`) KEY_BLOCK_SIZE = 128 VISIBLE WITH PARSER newparser)`);

          expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} using btree (name) key_block_size = 128 visible with parser newparser comment "index comment")`))
            .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} USING BTREE (\`name\`) KEY_BLOCK_SIZE = 128 VISIBLE WITH PARSER newparser COMMENT 'index comment')`);

          expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} using btree (name) key_block_size = 128 invisible with parser newparser comment "index comment")`))
            .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} USING BTREE (\`name\`) KEY_BLOCK_SIZE = 128 INVISIBLE WITH PARSER newparser COMMENT 'index comment')`);
        })
      });

      ['fulltext', 'spatial'].forEach(prefix => {
        ['index', 'key'].forEach(kind => {
          const type = `${prefix} ${kind}`
          it(`should support create table ${type}`, () => {
            expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} idx_name (name) key_block_size 128)`))
              .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} idx_name (\`name\`) KEY_BLOCK_SIZE 128)`);

            expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} (name) key_block_size = 128 visible)`))
              .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} (\`name\`) KEY_BLOCK_SIZE = 128 VISIBLE)`);

            expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} (name) key_block_size = 128 visible with parser newparser)`))
              .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} (\`name\`) KEY_BLOCK_SIZE = 128 VISIBLE WITH PARSER newparser)`);

            expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} (name) key_block_size = 128 visible with parser newparser comment "index comment")`))
              .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} (\`name\`) KEY_BLOCK_SIZE = 128 VISIBLE WITH PARSER newparser COMMENT 'index comment')`);

            expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} (name) key_block_size = 128 invisible with parser newparser comment "index comment")`))
              .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} (\`name\`) KEY_BLOCK_SIZE = 128 INVISIBLE WITH PARSER newparser COMMENT 'index comment')`);
          })
        })
      })
      it('should support empty index option', () => {
        expect(indexOptionToSQL()).to.equal(undefined)
        const indexOpt = {
          type: 'unknow',
        }
        expect(indexOptionToSQL(indexOpt)).to.equal(indexOpt.type.toUpperCase())
        expect(indexTypeAndOptionToSQL({})).to.be.eql([ '' ])
      })
    })

    describe('create constraint', () => {
      const type = 'constraint'
      it(`should support primary key`, () => {
        expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} idx_name primary key using hash (name) key_block_size 128)`))
          .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} \`idx_name\` PRIMARY KEY USING HASH (\`name\`) KEY_BLOCK_SIZE 128)`);
      })

      it(`should support unique key`, () => {
        ['index', 'key'].forEach(kind => {
          expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} idx_name unique ${kind} index_name using btree (name) key_block_size 128)`))
          .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} \`idx_name\` UNIQUE ${kind.toUpperCase()} \`index_name\` USING BTREE (\`name\`) KEY_BLOCK_SIZE 128)`);
        })
      })

      it(`should support foreign key`, () => {
        expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} \`idx_name\` foreign key index_name (name) references rdb.rta (name_alias) match simple on delete cascade on update set default)`))
          .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} \`idx_name\` FOREIGN KEY \`index_name\` (\`name\`) REFERENCES \`rdb\`.\`rta\` (\`name_alias\`) MATCH SIMPLE ON DELETE CASCADE ON UPDATE SET DEFAULT)`);
      })

      it(`should support constraint check`, () => {
        expect(getParsedSql(`CREATE TABLE Persons (
              ID int NOT NULL,
              LastName varchar(255) NOT NULL,
              FirstName varchar(255),
              Age int,
              CHECK (Age >= 18)
          )`))
          .to.equal(`CREATE TABLE \`Persons\` (\`ID\` INT NOT NULL, \`LastName\` VARCHAR(255) NOT NULL, \`FirstName\` VARCHAR(255), \`Age\` INT, CHECK (\`Age\` >= 18))`);
          expect(getParsedSql(`CREATE TABLE Persons (
            ID int NOT NULL,
            LastName varchar(255) NOT NULL,
            FirstName varchar(255),
            Age int CHECK (Age >= 18),
          )`, { database: 'transactsql' }))
          .to.equal(`CREATE TABLE [Persons] ([ID] INT NOT NULL, [LastName] VARCHAR(255) NOT NULL, [FirstName] VARCHAR(255), [Age] INT CHECK ([Age] >= 18))`);
          expect(getParsedSql(`CREATE TABLE Persons (
            ID int NOT NULL,
            LastName varchar(255) NOT NULL,
            FirstName varchar(255),
            Age int,
            City varchar(255),
            CONSTRAINT CHK_Person CHECK (Age >= 18 AND City = 'Sandnes')
        )`))
          .to.equal(`CREATE TABLE \`Persons\` (\`ID\` INT NOT NULL, \`LastName\` VARCHAR(255) NOT NULL, \`FirstName\` VARCHAR(255), \`Age\` INT, \`City\` VARCHAR(255), CONSTRAINT \`CHK_Person\` CHECK (\`Age\` >= 18 AND \`City\` = 'Sandnes'))`);
      })
    })

    describe('create table from like', () => {
      it('should support create table', () => {
        expect(getParsedSql(`create temporary table if not exists  dbname.tableName like odb.ota`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` LIKE `odb`.`ota`');
      })
    })

    describe('create table from query', () => {
      it('should support create table from simple select', () => {
        expect(getParsedSql(`create temporary table if not exists  dbname.tableName (id int, name varchar(128)) engine = innodb ignore as select id, name from qdb.qta`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT, `name` VARCHAR(128)) ENGINE = INNODB IGNORE AS SELECT `id`, `name` FROM `qdb`.`qta`');
      })

      it('should support create table from union', () => {
        expect(getParsedSql(`create temporary table if not exists  dbname.tableName (id int, name varchar(128)) engine = innodb ignore as select id, name from qdb.qta union select ab as id, cd as name from qdb.qtc`))
          .to.equal('CREATE TEMPORARY TABLE IF NOT EXISTS `dbname`.`tableName` (`id` INT, `name` VARCHAR(128)) ENGINE = INNODB IGNORE AS SELECT `id`, `name` FROM `qdb`.`qta` UNION SELECT `ab` AS `id`, `cd` AS `name` FROM `qdb`.`qtc`');
      })
    })

    describe('create table unknow resource', () => {
      it('should throw error, when reosurce unkonw', () => {
        const columnDefinition = [{
          "column": {
            "type": "column_ref",
            "table": null,
            "column": "id"
          },
          "definition": {
            "dataType": "INT"
          },
          "nullable": null,
          "default_val": null,
          "auto_increment": null,
          "unique_or_primary": null,
          "comment": null,
          "collate": null,
          "column_format": null,
          "storage": null,
          "reference_definition": null,
          "resource": "xx"
        }]
        const ast = {
          "type": "create",
          "keyword": "table",
          "temporary": "temporary",
          "if_not_exists": null,
          "table": [
            {
                "db": "dbname",
                "table": "tableName",
                "as": null
            }
          ],
          "ignore_replace": null,
          "as": null,
          "query_expr": null,
          "table_options": null
        }
        expect(parser.sqlify(ast)).to.be.eql('CREATE TEMPORARY TABLE `dbname`.`tableName`')
        ast.create_definitions = []
        expect(parser.sqlify(ast)).to.be.eql('CREATE TEMPORARY TABLE `dbname`.`tableName` ()')
        ast.create_definitions = ['', null]
        expect(parser.sqlify(ast)).to.be.eql('CREATE TEMPORARY TABLE `dbname`.`tableName` (, )')
        ast.create_definitions = columnDefinition
        expect(parser.sqlify.bind(parser, ast)).to.throw('unknow resource = xx type')
      })
    })

    describe('create table using pg', () => {

      it ('supports basic things', () => {
        expect(getParsedSql(`CREATE TABLE foo (id uuid)`, { database: 'postgresql' })).to.equal('CREATE TABLE "foo" ("id" UUID)')
        expect(getParsedSql(`CREATE TABLE foo (value text unique)`, { database: 'postgresql' })).to.equal('CREATE TABLE "foo" ("value" TEXT UNIQUE)')
        expect(getParsedSql(`CREATE TABLE accounts (
          id UUID DEFAULT uuid_generate_v4() NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,

          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NULL,

          PRIMARY KEY (id)
        );`, { database: 'postgresql' })).to.equal('CREATE TABLE "accounts" ("id" UUID NOT NULL DEFAULT uuid_generate_v4(), "email" TEXT NOT NULL, "password" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP NULL, PRIMARY KEY ("id"))');
      })

      it('should support pg bool/boolean type', () => {
        expect(getParsedSql(`CREATE TABLE "foos"
        (
            "Id" varchar(25) not null,
            "status" boolean default 't',
            "is_deleted" bool null,
            "is_man" boolean not null default 'f'
        );`, { database: 'postgresql' })).to.equal(`CREATE TABLE "foos" ("Id" VARCHAR(25) NOT NULL, "status" BOOLEAN DEFAULT 't', "is_deleted" BOOL NULL, "is_man" BOOLEAN NOT NULL DEFAULT 'f')`)
      })
      it('should support pg time length type', () => {
        expect(getParsedSql(`CREATE TABLE "foos"
        (
            "Id" varchar(25) not null,
            "TIME" time(7) null
        );`, { database: 'postgresql' })).to.equal(`CREATE TABLE "foos" ("Id" VARCHAR(25) NOT NULL, "TIME" TIME(7) NULL)`)
      })
    })
    describe('create trigger pg', () => {
      it('should support basic trigger', () => {
        expect(getParsedSql(`CREATE TRIGGER check_update
        BEFORE INSERT ON accounts
        FOR EACH ROW
        EXECUTE PROCEDURE check_account_update();`, { database: 'postgresql' })).to.equal('CREATE TRIGGER "check_update" BEFORE INSERT ON "accounts" FOR EACH ROW EXECUTE PROCEDURE check_account_update()')
      })
      it('should support trigger with when expression', () => {
        expect(getParsedSql(`CREATE TRIGGER check_update
        BEFORE DELETE ON accounts
        NOT DEFERRABLE INITIALLY DEFERRED
        FOR EACH ROW
        WHEN (OLD.balance IS DISTINCT FROM NEW.balance)
        EXECUTE PROCEDURE check_account_update();`, { database: 'postgresql' })).to.equal('CREATE TRIGGER "check_update" BEFORE DELETE ON "accounts" NOT DEFERRABLE INITIALLY DEFERRED FOR EACH ROW WHEN "OLD"."balance" IS DISTINCT FROM "NEW"."BALANCE" EXECUTE PROCEDURE check_account_update()')
      })
      it('should support trigger with when expression with * and deferrable', () => {
        expect(getParsedSql(`CREATE TRIGGER log_update
        AFTER TRUNCATE ON accounts
        FROM bank.accounts
        DEFERRABLE INITIALLY IMMEDIATE
        FOR EACH ROW
        WHEN (OLD.* IS DISTINCT FROM NEW.*)
        EXECUTE PROCEDURE log_account_update();`, { database: 'postgresql' })).to.equal('CREATE TRIGGER "log_update" AFTER TRUNCATE ON "accounts" FROM "bank"."accounts" DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW WHEN "OLD".* IS DISTINCT FROM "NEW".* EXECUTE PROCEDURE log_account_update()')
      })
      it('should support trigger with update of', () => {
        expect(getParsedSql(`CREATE TRIGGER log_update
        AFTER UPDATE OF user, name, salary OR INSERT ON accounts
        DEFERRABLE INITIALLY IMMEDIATE
        WHEN (OLD.* IS DISTINCT FROM NEW.*)
        EXECUTE PROCEDURE log_account_update();`, { database: 'postgresql' })).to.equal('CREATE TRIGGER "log_update" AFTER UPDATE OF "user", "name", "salary" OR INSERT ON "accounts" DEFERRABLE INITIALLY IMMEDIATE WHEN "OLD".* IS DISTINCT FROM "NEW".* EXECUTE PROCEDURE log_account_update()')
      })
    })
  })

  describe('create extension pg', () => {
    it('should support basic extension', () => {
      expect(getParsedSql(`CREATE EXTENSION hstore;`, { database: 'postgresql' })).to.equal('CREATE EXTENSION hstore')
    })
    it('should support create extension if not exists', () => {
      expect(getParsedSql(`CREATE EXTENSION if not exists hstore SCHEMA public FROM unpackaged;`, { database: 'postgresql' })).to.equal('CREATE EXTENSION IF NOT EXISTS hstore SCHEMA public FROM unpackaged')
    })
    it('should support create extension with version', () => {
      expect(getParsedSql(`CREATE EXTENSION if not exists hstore with SCHEMA public version latested FROM unpackaged;`, { database: 'postgresql' })).to.equal('CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public VERSION latested FROM unpackaged')
    })
    it('should support create extension literal string version ', () => {
      expect(getParsedSql(`CREATE EXTENSION if not exists hstore SCHEMA public version "latest" FROM unpackaged;`, { database: 'postgresql' })).to.equal('CREATE EXTENSION IF NOT EXISTS hstore SCHEMA public VERSION \'latest\' FROM unpackaged')
    })
  })

  describe('create table with tsql', () => {
    it('should support identity without number', () => {
      expect(getParsedSql(`CREATE TABLE test (
        id BIGINT NOT NULL IDENTITY PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        uuid UNIQUEIDENTIFIER NOT NULL DEFAULT(NEWID()) unique,
        nc nchar(123) not null,
        nvc nvarchar(200) not null,
        nvcm nvarchar(max) not null,
        created_at datetime NOT NULL DEFAULT GETDATE()
      )`, { database: 'transactsql' })).to.equal('CREATE TABLE [test] ([id] BIGINT NOT NULL IDENTITY PRIMARY KEY, [title] VARCHAR(100) NOT NULL, [uuid] UNIQUEIDENTIFIER NOT NULL DEFAULT (NEWID()) UNIQUE, [nc] NCHAR(123) NOT NULL, [nvc] NVARCHAR(200) NOT NULL, [nvcm] NVARCHAR(max) NOT NULL, [created_at] DATETIME NOT NULL DEFAULT GETDATE())')
    })
    it('should support identity without number', () => {
      expect(getParsedSql(`CREATE TABLE test (
        id BIGINT NOT NULL IDENTITY PRIMARY KEY,
        [title] VARCHAR(100) NOT NULL,
        [uuid] UNIQUEIDENTIFIER NOT NULL DEFAULT(NEWID()) unique,
        [nc] nchar(123) not null,
        [nvc] nvarchar(200) not null,
        [nvcm] nvarchar(max) not null
      )`, { database: 'transactsql' })).to.equal('CREATE TABLE [test] ([id] BIGINT NOT NULL IDENTITY PRIMARY KEY, [title] VARCHAR(100) NOT NULL, [uuid] UNIQUEIDENTIFIER NOT NULL DEFAULT (NEWID()) UNIQUE, [nc] NCHAR(123) NOT NULL, [nvc] NVARCHAR(200) NOT NULL, [nvcm] NVARCHAR(max) NOT NULL)')
    })
    it('should support identity with seed and increment', () => {
      expect(getParsedSql(`CREATE TABLE test (
        id BIGINT NOT NULL IDENTITY(1,2) PRIMARY KEY,
        title VARCHAR(100) NOT NULL
      )`, { database: 'transactsql' })).to.equal('CREATE TABLE [test] ([id] BIGINT NOT NULL IDENTITY(1, 2) PRIMARY KEY, [title] VARCHAR(100) NOT NULL)')
    })
    it('should support identity with seed and increment', () => {
      expect(getParsedSql(`CREATE TABLE test (
        id BIGINT NOT NULL PRIMARY KEY IDENTITY(1,2),
        title VARCHAR(100) NOT NULL
      )`, { database: 'transactsql' })).to.equal('CREATE TABLE [test] ([id] BIGINT NOT NULL IDENTITY(1, 2) PRIMARY KEY, [title] VARCHAR(100) NOT NULL)')
    })
    it('should support create column as ', () => {
      expect(getParsedSql(`CREATE TABLE test (
        id BIGINT NOT NULL PRIMARY KEY IDENTITY(1, 1),
        questions_correct BIGINT NOT NULL DEFAULT(0),
        questions_total BIGINT NOT NULL,
        score AS (questions_correct * 100 / questions_total)
      );`, { database: 'transactsql' })).to.equal('CREATE TABLE [test] ([id] BIGINT NOT NULL IDENTITY(1, 1) PRIMARY KEY, [questions_correct] BIGINT NOT NULL DEFAULT (0), [questions_total] BIGINT NOT NULL, [score] AS ([questions_correct] * 100 / [questions_total]))')
      expect(getParsedSql(`CREATE TABLE test (
        id BIGINT NOT NULL PRIMARY KEY IDENTITY(1, 1),
        questions_correct BIGINT NOT NULL DEFAULT(0),
        questions_total BIGINT NOT NULL,
        score AS questions_correct * 100 / questions_total
      );`, { database: 'transactsql' })).to.equal('CREATE TABLE [test] ([id] BIGINT NOT NULL IDENTITY(1, 1) PRIMARY KEY, [questions_correct] BIGINT NOT NULL DEFAULT (0), [questions_total] BIGINT NOT NULL, [score] AS [questions_correct] * 100 / [questions_total])')
    })
    it('should support bracket around data type', () => {
      expect(getParsedSql(`CREATE TABLE [dbo].[foo]
      (
          [Id] [nvarchar](25) NOT NULL,
          name [nchar](123) not null,
          [test] [real] NULL,
          [gmt_modified] [time](7) NULL,
          [abc] [UNIQUEIDENTIFIER] null,
      );`, { database: 'transactsql' })).to.equal('CREATE TABLE [dbo].[foo] ([Id] NVARCHAR(25) NOT NULL, [name] NCHAR(123) NOT NULL, [test] REAL NULL, [gmt_modified] TIME(7) NULL, [abc] UNIQUEIDENTIFIER NULL)')
    })
  })

  describe('create index with tsql', () => {
    it('should support a nonclustered index on a table or view', () => {
      expect(getParsedSql('CREATE INDEX i1 ON t1 (col1, col2 DESC);', { database: 'transactsql' })).to.equal('CREATE INDEX [i1] ON [t1] ([col1] ASC, [col2] DESC)')
    })

    it('should suport create a clustered, unique, nonclustered', () => {
      expect(getParsedSql('CREATE CLUSTERED INDEX i1 ON d1.s1.t1 (col1);', { database: 'transactsql' })).to.equal('CREATE CLUSTERED INDEX [i1] ON [d1.s1].[t1] ([col1] ASC)')
      expect(getParsedSql('CREATE UNIQUE INDEX i1 ON t1 (col1 DESC, col2 ASC, col3 DESC);', { database: 'transactsql' })).to.equal('CREATE UNIQUE INDEX [i1] ON [t1] ([col1] DESC, [col2] ASC, [col3] DESC)')
      expect(getParsedSql('CREATE NONCLUSTERED INDEX ix_test ON [test] ([test_col]);', { database: 'transactsql' })).to.equal('CREATE NONCLUSTERED INDEX [ix_test] ON [test] ([test_col] ASC)')
    })

    it('should support include', () => {
      expect(getParsedSql('CREATE NONCLUSTERED INDEX ix_test ON [test] ([test_col]) include (test_col, test_col2);', { database: 'transactsql' })).to.equal('CREATE NONCLUSTERED INDEX [ix_test] ON [test] ([test_col] ASC) INCLUDE ([test_col], [test_col2])')
    })

    it('should support include and where', () => {
      expect(getParsedSql("CREATE NONCLUSTERED INDEX ix_test ON [test] ([test_col]) include (test_col, test_col2) where StartDate > '20000101' AND EndDate <= '20000630' and ComponentID IN (533, 324, 753) and EndDate IS NOT NULL;", { database: 'transactsql' })).to.equal("CREATE NONCLUSTERED INDEX [ix_test] ON [test] ([test_col] ASC) INCLUDE ([test_col], [test_col2]) WHERE [StartDate] > '20000101' AND [EndDate] <= '20000630' AND [ComponentID] IN (533, 324, 753) AND [EndDate] IS NOT NULL")
    })

    it('should support include and where', () => {
      expect(getParsedSql("CREATE NONCLUSTERED INDEX ix_test ON [test] ([test_col]) include (test_col, test_col2) where StartDate > '20000101' AND EndDate <= '20000630' and ComponentID IN (533, 324, 753) and EndDate IS NOT NULL with (DATA_COMPRESSION = ROW ON PARTITIONS (2, 4, 6 TO 8));", { database: 'transactsql' })).to.equal("CREATE NONCLUSTERED INDEX [ix_test] ON [test] ([test_col] ASC) INCLUDE ([test_col], [test_col2]) WHERE [StartDate] > '20000101' AND [EndDate] <= '20000630' AND [ComponentID] IN (533, 324, 753) AND [EndDate] IS NOT NULL WITH (DATA_COMPRESSION = ROW ON PARTITIONS (2, 4, 6 TO 6))")
    })

    it('should support include and where', () => {
      expect(getParsedSql("CREATE NONCLUSTERED INDEX ix_test ON [test] ([test_col]) include (test_col, test_col2) where StartDate > '20000101' AND EndDate <= '20000630' and ComponentID IN (533, 324, 753) and EndDate IS NOT NULL with (DATA_COMPRESSION = ROW ON PARTITIONS (2, 4, 6 TO 8)) on pn(abc) FILESTREAM_ON filename;", { database: 'transactsql' })).to.equal("CREATE NONCLUSTERED INDEX [ix_test] ON [test] ([test_col] ASC) INCLUDE ([test_col], [test_col2]) WHERE [StartDate] > '20000101' AND [EndDate] <= '20000630' AND [ComponentID] IN (533, 324, 753) AND [EndDate] IS NOT NULL WITH (DATA_COMPRESSION = ROW ON PARTITIONS (2, 4, 6 TO 6)) ON pn([abc]) FILESTREAM_ON filename")
    })

    it('should return undefined for empty index columns', () => {
      expect(columnOrderListToSQL()).to.be.equal(undefined)
    })
  })
  it('throw error when create type is unknow', () => {
    const ast = {
      type: 'create',
      keyword: 'unknow_create_type'
    }
    expect(parser.sqlify.bind(parser, ast)).to.throw(`unknow create resource ${ast.keyword}`)
  })
})
