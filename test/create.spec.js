const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('create', () => {
  const parser = new Parser();

  function getParsedSql(sql) {
    const ast = parser.astify(sql);
    return parser.sqlify(ast);
  }

  describe('create table with basic', () => {
    it('should support create table', () => {
      expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128))`))
        .to.equal('CREATE TEMPORARY TABLE `dbname`.`tableName` (`id` INT, `name` VARCHAR(128))');

      expect(getParsedSql(`create table dbname.tableName (id INT(11) primary key) ENGINE = MEMORY`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11) PRIMARY KEY) ENGINE = MEMORY');
      expect(getParsedSql(`create table dbname.tableName (id INT(11) primary key, name varchar(128) unique key) ENGINE = MEMORY`))
        .to.equal('CREATE TABLE `dbname`.`tableName` (`id` INT(11) PRIMARY KEY, `name` VARCHAR(128) UNIQUE KEY) ENGINE = MEMORY');
    })

    it('should support create temporary table', () => {
      expect(getParsedSql(`create temporary table dbname.tableName (id INT primary key) ENGINE = MEMORY`))
        .to.equal('CREATE TEMPORARY TABLE `dbname`.`tableName` (`id` INT PRIMARY KEY) ENGINE = MEMORY');
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
          expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} idx_name using hash (name) key_block_size 128)`))
            .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} idx_name USING HASH (\`name\`) KEY_BLOCK_SIZE 128)`);

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
    })

    describe('create constraint', () => {
      const type = 'constraint'
      it(`should support primary key`, () => {
        expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} idx_name primary key using hash (name) key_block_size 128)`))
          .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} idx_name PRIMARY KEY USING HASH (\`name\`) KEY_BLOCK_SIZE 128)`);
      })

      it(`should support unique key`, () => {
        ['index', 'key'].forEach(kind => {
          expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} idx_name unique ${kind} index_name using btree (name) key_block_size 128)`))
          .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} idx_name UNIQUE ${kind.toUpperCase()} index_name USING BTREE (\`name\`) KEY_BLOCK_SIZE 128)`);
        })
      })

      it(`should support foreign key`, () => {
        expect(getParsedSql(`create temporary table dbname.tableName (id int, name varchar(128), ${type} idx_name foreign key index_name (name) references rdb.rta (name_alias) match simple on delete cascade on update set default)`))
          .to.equal(`CREATE TEMPORARY TABLE \`dbname\`.\`tableName\` (\`id\` INT, \`name\` VARCHAR(128), ${type.toUpperCase()} idx_name FOREIGN KEY index_name (\`name\`) REFERENCES \`rdb\`.\`rta\` (\`name_alias\`) MATCH SIMPLE ON DELETE CASCADE ON UPDATE SET DEFAULT)`);
      })
    })
  })
})

