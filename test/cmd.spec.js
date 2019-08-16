'use strict';

const { expect } = require('chai');
const { Parser } = require('../');


describe('Command SQL', () => {
  const parser = new Parser();
  let sql;

  function getParsedSql(sql) {
    const ast = parser.astify(sql);
    return parser.sqlify(ast);
  }

  describe('drop and truncate', () => {
    ['drop', 'truncate'].forEach(action => {
      it(`should support MySQL ${action}`, () => {
        expect(getParsedSql(`${action} table tableA`))
          .to.equal(`${action.toUpperCase()} TABLE \`tableA\``);
      });

      it(`should support MySQL ${action} with db prefix`, () => {
        expect(getParsedSql(`${action} table dbA.tableA`))
          .to.equal(`${action.toUpperCase()} TABLE \`dbA\`.\`tableA\``);
      });

      it(`should support MySQL ${action} with semicolon suffix`, () => {
        expect(getParsedSql(`${action} table dbA.tableA;`))
          .to.equal(`${action.toUpperCase()} TABLE \`dbA\`.\`tableA\``);
      });

    })

    it(`should truncate TABLE optional`, () => {
      expect(getParsedSql('truncate  dbA.tableA'))
          .to.equal('TRUNCATE `dbA`.`tableA`');
      expect(getParsedSql('truncate tableA'))
          .to.equal('TRUNCATE `tableA`');
      expect(getParsedSql('truncate  TABLE tableA'))
          .to.equal('TRUNCATE TABLE `tableA`');
    })

  })

  describe('rename', () => {
    it(`should support MySQL rename`, () => {
      expect(getParsedSql('rename table a to b'))
        .to.equal('RENAME TABLE `a` TO `b`');
    });

    it(`should support MySQL rename multiples`, () => {
      expect(getParsedSql('rename table a to b, c to d'))
        .to.equal('RENAME TABLE `a` TO `b`, `c` TO `d`');
    });

    it(`should support MySQL rename multiples with db prefix`, () => {
      expect(getParsedSql('rename table d.a to d.b, d.c to d.d'))
        .to.equal('RENAME TABLE `d`.`a` TO `d`.`b`, `d`.`c` TO `d`.`d`');
    });
  })

  describe('call', () => {
    it('should support MySQL call', () => {
      expect(getParsedSql('call sp(1, "123")'))
        .to.equal('CALL sp(1, \'123\')')
    })

    it('should support MySQL call with no parameters', () => {
      expect(getParsedSql('call sp()'))
        .to.equal('CALL sp()')
    })

    it('should support MySQL call without parentheses and parameters', () => {
      expect(getParsedSql('call sp'))
        .to.equal('CALL sp')
    })

    it('should support MySQL call without dynamic value', () => {
      expect(getParsedSql('call sp(@firstParameter, @secondParameter)'))
        .to.equal('CALL sp(@firstParameter, @secondParameter)')
    })

    it('should support MySQL call with multiple different type parameters', () => {
      expect(getParsedSql('call sp(12, "test", @firstParameter)'))
        .to.equal('CALL sp(12, \'test\', @firstParameter)')
    })

    it('should support MySQL call cross database', () => {
      expect(getParsedSql('call db.sp(12, "test", @firstParameter)'))
        .to.equal('CALL db.sp(12, \'test\', @firstParameter)')
      expect(getParsedSql('call `db`.`sp`(12, "test", @firstParameter);'))
        .to.equal('CALL db.sp(12, \'test\', @firstParameter)')
      expect(getParsedSql('call `db`.`sp`'))
        .to.equal('CALL db.sp')
    })

  })

  describe('use', () => {
    it(`should support MySQL use`, () => {
      expect(getParsedSql('use databaseA'))
        .to.equal('USE `databaseA`');
    });

    it(`should support MySQL use with semicolon`, () => {
      expect(getParsedSql('use databaseA;'))
        .to.equal('USE `databaseA`');
    });

  })

  describe('multiple statement with cmd', () => {
    it(`should support cmd multiple use`, () => {
      expect(getParsedSql('use databaseA;drop table tableA;truncate table tableB; call sp'))
        .to.equal('USE `databaseA` ; DROP TABLE `tableA` ; TRUNCATE TABLE `tableB` ; CALL sp');

    });

    it(`should support cmd and crud multiple use`, () => {
      expect(getParsedSql('select * from tableD;use databaseA;drop table tableA;truncate table tableB; call sp;delete from tableC;insert into tableE values("123");update tableF set id="333"'))
        .to.equal('SELECT * FROM `tableD` ; USE `databaseA` ; DROP TABLE `tableA` ; TRUNCATE TABLE `tableB` ; CALL sp ; DELETE FROM `tableC` ; INSERT INTO `tableE` VALUES (\'123\') ; UPDATE `tableF` SET `id` = \'333\'');

    });
  })

  describe('alter', () => {
    const KEYWORDS = ['', 'COLUMN ']
    it(`should support MySQL alter add column`, () => {
      KEYWORDS.forEach(keyword => {
        expect(getParsedSql(`alter table a add ${keyword}xxx int`))
        .to.equal(`ALTER TABLE \`a\` ADD ${keyword}xxx INT`);
        expect(getParsedSql(`alter table a add ${keyword}yyy varchar(128)`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword}yyy VARCHAR(128)`);
        expect(getParsedSql(`alter table a add ${keyword}zzz varchar(128), add aaa date`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword}zzz VARCHAR(128), ADD aaa DATE`);
      })
    });

    it(`should support MySQL alter drop column`, () => {
      KEYWORDS.forEach(keyword => {
        expect(getParsedSql(`alter table a drop ${keyword}xxx`))
        .to.equal(`ALTER TABLE \`a\` DROP ${keyword}xxx`);
        expect(getParsedSql(`alter table a drop ${keyword}xxx, drop ${keyword}yyy`))
        .to.equal(`ALTER TABLE \`a\` DROP ${keyword}xxx, DROP ${keyword}yyy`);
      })
    });

    it('should support MySQL alter mix action', () => {
      KEYWORDS.forEach(keyword => {
        expect(getParsedSql(`alter table a drop ${keyword}xxx, add ${keyword}yyy varchar(256), add ${keyword}zzz date, drop ${keyword} aaa`))
        .to.equal(`ALTER TABLE \`a\` DROP ${keyword}xxx, ADD ${keyword}yyy VARCHAR(256), ADD ${keyword}zzz DATE, DROP ${keyword}aaa`);
      })
    })
  })

  describe('set', () => {
    it('should support set variable definde', () => {
      expect(getParsedSql(`set @a = 123;`))
        .to.equal(`SET @a = 123`);
      expect(getParsedSql(`set @a = 123; set @b = "mm"`))
        .to.equal(`SET @a = 123 ; SET @b = 'mm'`);
      expect(getParsedSql(`set @a.id = 123; set @b.yy.xx = "mm"`))
        .to.equal(`SET @a.id = 123 ; SET @b.yy.xx = 'mm'`);
    })

    it('should support set keyword variable definde', () => {
      const KEYWORDS = ['GLOBAL', 'SESSION', 'LOCAL', 'PERSIST', 'PERSIST_ONLY']
      KEYWORDS.forEach(keyword => {
        expect(getParsedSql(`set ${keyword} xx.yy = 123; set ${keyword} yy = "abc"`))
        .to.equal(`SET ${keyword} xx.yy = 123 ; SET ${keyword} yy = 'abc'`);
        expect(getParsedSql(`set @@${keyword}.id = 123; set @@${keyword}.yy.xx = "abcd"`))
        .to.equal(`SET @@${keyword}.id = 123 ; SET @@${keyword}.yy.xx = 'abcd'`);
      })
    })
  })

})