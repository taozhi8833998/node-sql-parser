const { expect } = require('chai');
const Parser = require('../src/parser').default
const { renameToSQL, commonCmdToSQL } = require('../src/command')


describe('Command SQL', () => {
  const parser = new Parser();
  let sql;

  function getParsedSql(sql, opt) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
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
          .to.equal('TRUNCATE TABLE `dbA`.`tableA`');
      expect(getParsedSql('truncate tableA'))
          .to.equal('TRUNCATE TABLE `tableA`');
      expect(getParsedSql('truncate TABLE tableA'))
          .to.equal('TRUNCATE TABLE `tableA`');
    })

    it('should support unsupported keyword', () => {
      const ast = {
        "type": "truncate",
        "table": [
           {
              "db": null,
              "table": "abc",
              "as": null
           }
        ]
     }
      expect(commonCmdToSQL(ast)).to.be.equal(ast.type.toUpperCase())
    })

    it('should support drop procedure in tsql', () => {
      const opt = {
        database: 'transactsql'
      }
      expect(getParsedSql('drop procedure [test]', opt))
          .to.equal('DROP PROCEDURE [test]')
      expect(getParsedSql('drop procedure test', opt))
          .to.equal('DROP PROCEDURE [test]')
    })

  })

  describe('rename', () => {
    it(`should support MySQL rename`, () => {
      expect(getParsedSql('rename table a to b'))
        .to.equal('RENAME TABLE `a` TO `b`');
    });

    it(`should support MySQL rename empty table`, () => {
      expect(renameToSQL({ type: 'rename'})).to.equal('RENAME TABLE ')
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

  describe('desc', () => {
    ['desc', 'describe'].forEach(keyword => {
      it(`should support MySQL ${keyword}`, () => {
        expect(getParsedSql(`${keyword} tableA`))
          .to.equal('DESC `tableA`');
      });
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
        .to.equal(`ALTER TABLE \`a\` ADD ${keyword}\`xxx\` INT`);
        expect(getParsedSql(`alter table a add ${keyword}yyy varchar(128)`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword}\`yyy\` VARCHAR(128)`);
        expect(getParsedSql(`alter table a add ${keyword}zzz varchar(128), add aaa date`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword}\`zzz\` VARCHAR(128), ADD \`aaa\` DATE`);
      })
    });

    it('should change column', () => {
      expect(getParsedSql('alter table places change city city2 varchar(255)'))
        .to.equal('ALTER TABLE `places` CHANGE `city` `city2` VARCHAR(255)');
      expect(getParsedSql('alter table places change city city2 varchar(255) first city'))
        .to.equal('ALTER TABLE `places` CHANGE `city` `city2` VARCHAR(255) FIRST `city`');
    })

    it('should support alter column with algorithm and lock option', () => {
      expect(getParsedSql("ALTER TABLE `test`.`test` ADD COLUMN test VARCHAR(20) NOT NULL DEFAULT 'xx', ALGORITHM=INPLACE, LOCK=NONE;"))
        .to.equal("ALTER TABLE `test`.`test` ADD COLUMN `test` VARCHAR(20) NOT NULL DEFAULT 'xx', ALGORITHM = INPLACE, LOCK = NONE");
    })

    it('should support alter with BIT type', () => {
      expect(getParsedSql('ALTER TABLE newtable ADD newcol BIT(1)'))
        .to.equal('ALTER TABLE `newtable` ADD `newcol` BIT(1)');
    })

    it('should support alter drop primary key', () => {
      expect(getParsedSql('alter table places drop primary key'))
        .to.equal('ALTER TABLE `places` DROP PRIMARY KEY');
      expect(getParsedSql('alter table places drop foreign key abc'))
        .to.equal('ALTER TABLE `places` DROP FOREIGN KEY `abc`');
    })

    it('should support alter without expr', () => {
      const expr = [
        {
          "action": "add",
          "column": {
            type: 'column_ref',
            table: null,
            column: 'xxx'
          },
          "definition": {
              "dataType": "INT"
          },
          "keyword": "COLUMN",
          "resource": "column",
          "type": "alter"
        }
      ]
      const resource = 'unknow'
      const ast = {
        "type": "alter",
        "table": [
          {
            "db": null,
            "table": "a",
            "as": null
          }
        ],
      }
      expect(parser.sqlify(ast)).to.be.equal('ALTER TABLE `a`')
      ast.expr = expr
      expect(parser.sqlify(ast)).to.be.equal('ALTER TABLE `a` ADD COLUMN \`xxx\` INT')
      expr[0].resource = resource
      expect(parser.sqlify(ast)).to.be.equal('ALTER TABLE `a` ADD COLUMN')
    })

    it(`should support MySQL alter drop check and column`, () => {
      KEYWORDS.concat(['CHECK ']).forEach(keyword => {
        expect(getParsedSql(`alter table a drop ${keyword}xxx`))
        .to.equal(`ALTER TABLE \`a\` DROP ${keyword}\`xxx\``);
        expect(getParsedSql(`alter table a drop ${keyword}xxx, drop ${keyword}yyy`))
        .to.equal(`ALTER TABLE \`a\` DROP ${keyword}\`xxx\`, DROP ${keyword}\`yyy\``);
      })
      expect(getParsedSql(`alter table a drop constraint xxx`, { database: 'transactsql' }))
        .to.equal('ALTER TABLE [a] DROP CONSTRAINT [xxx]');
    });

    it('should support alter add constraint definition', () => {
      expect(getParsedSql(`ALTER TABLE \`CSEHistory\` ADD CONSTRAINT \`CSEHistoryDel\` FOREIGN KEY ( \`SystemUUID\` ) REFERENCES \`Systems\` (UUID)
      ON UPDATE RESTRICT ON
      DELETE CASCADE`))
        .to.equal('ALTER TABLE `CSEHistory` ADD CONSTRAINT `CSEHistoryDel` FOREIGN KEY (`SystemUUID`) REFERENCES `Systems` (`UUID`) ON UPDATE RESTRICT ON DELETE CASCADE');
    })

    it('should support alter add constraint check', () => {
      const opt = {
        database: 'transactsql'
      }
      expect(getParsedSql(`ALTER TABLE Persons ADD CHECK (Age>=18)`))
        .to.equal('ALTER TABLE `Persons` ADD CHECK (`Age` >= 18)');
      expect(getParsedSql(`ALTER TABLE Persons ADD CONSTRAINT CHK_PersonAge CHECK (Age>=18 AND City='Sandnes');`))
        .to.equal('ALTER TABLE `Persons` ADD CONSTRAINT \`CHK_PersonAge\` CHECK (`Age` >= 18 AND `City` = \'Sandnes\')');
      expect(getParsedSql(`ALTER TABLE Persons ADD CHECK (Age>=18)`, opt))
        .to.equal('ALTER TABLE [Persons] ADD CHECK ([Age] >= 18)');
      expect(getParsedSql(`ALTER TABLE Persons ADD CONSTRAINT CHK_PersonAge CHECK (Age>=18 AND City='Sandnes')`, opt))
      expect(getParsedSql('ALTER TABLE [test] alter COLUMN [a] NVARCHAR(MAX) NOT NULL;', opt))
        .to.equal('ALTER TABLE [test] ALTER COLUMN [a] NVARCHAR(max) NOT NULL');
    })

    it('should support enable and disable check constraint', () => {
      const opt = {
        database: 'transactsql'
      }
      expect(getParsedSql(`ALTER TABLE Persons with check check constraint check_salary`, opt))
        .to.equal('ALTER TABLE [Persons] WITH CHECK CHECK CONSTRAINT [check_salary]');
      expect(getParsedSql(`ALTER TABLE Persons nocheck constraint check_salary`, opt))
        .to.equal('ALTER TABLE [Persons] NOCHECK CONSTRAINT [check_salary]');
    })

    it('should support MySQL alter mix action', () => {
      KEYWORDS.forEach(keyword => {
        expect(getParsedSql(`alter table a drop ${keyword}xxx, add ${keyword}yyy varchar(256), add ${keyword}zzz date, drop ${keyword} aaa`))
        .to.equal(`ALTER TABLE \`a\` DROP ${keyword}\`xxx\`, ADD ${keyword}\`yyy\` VARCHAR(256), ADD ${keyword}\`zzz\` DATE, DROP ${keyword}\`aaa\``);
      })
    })

    it(`should support MySQL alter add index or key`, () => {
      ["index", "key"].forEach(keyword => {
        expect(getParsedSql(`alter table a add ${keyword} ("name", "alias")`))
        .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()} (\`name\`, \`alias\`)`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx ("name", "alias")`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`)`);
        expect(getParsedSql(`ALTER TABLE \`a\` ADD ${keyword} name_idx using btree ("name", "alias")`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()} name_idx USING BTREE (\`name\`, \`alias\`)`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx ("name", "alias") KEY_BLOCK_SIZE = 324`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`) KEY_BLOCK_SIZE = 324`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx using hash ("name", "alias") KEY_BLOCK_SIZE = 324`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()} name_idx USING HASH (\`name\`, \`alias\`) KEY_BLOCK_SIZE = 324`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx using hash ("name", "alias") KEY_BLOCK_SIZE 123`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()
          } name_idx USING HASH (\`name\`, \`alias\`) KEY_BLOCK_SIZE 123`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx using hash ("name", "alias") with parser parser_name`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()
          } name_idx USING HASH (\`name\`, \`alias\`) WITH PARSER parser_name`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx using hash ("name", "alias") visible`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()
          } name_idx USING HASH (\`name\`, \`alias\`) VISIBLE`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx using hash ("name", "alias") invisible`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()
          } name_idx USING HASH (\`name\`, \`alias\`) INVISIBLE`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx ("name", "alias") using hash`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()
          } name_idx (\`name\`, \`alias\`) USING HASH`);
        expect(getParsedSql(`alter table a add ${keyword} name_idx ("name", "alias") using btree`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword.toUpperCase()
          } name_idx (\`name\`, \`alias\`) USING BTREE`);
      })
    });

    ["fulltext", "spatial"].forEach(kc => {
      it(`should support MySQL alter add ${kc} index or key`, () => {
        ["index", "key"].forEach(keyword => {
          expect(getParsedSql(`alter table a add ${kc}  ("name", "alias")`))
          .to.equal(`ALTER TABLE \`a\` ADD ${kc.toUpperCase()} (\`name\`, \`alias\`)`);
          expect(getParsedSql(`alter table a add ${kc} ${keyword} name_idx ("name", "alias")`))
            .to.equal(`ALTER TABLE \`a\` ADD ${kc.toUpperCase()} ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`)`);
          expect(getParsedSql(`alter table a add ${kc} ${keyword} name_idx ("name", "alias") KEY_BLOCK_SIZE = 324`))
            .to.equal(`ALTER TABLE \`a\` ADD ${kc.toUpperCase()} ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`) KEY_BLOCK_SIZE = 324`);
          expect(getParsedSql(`alter table a add ${kc} ${keyword} name_idx ("name", "alias") KEY_BLOCK_SIZE 123`))
            .to.equal(`ALTER TABLE \`a\` ADD ${kc.toUpperCase()} ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`) KEY_BLOCK_SIZE 123`);
          expect(getParsedSql(`alter table a add ${kc} ${keyword} name_idx ("name", "alias") with parser parser_name`))
            .to.equal(`ALTER TABLE \`a\` ADD ${kc.toUpperCase()} ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`) WITH PARSER parser_name`);
          expect(getParsedSql(`alter table a add ${kc} ${keyword} name_idx ("name", "alias") invisible`))
            .to.equal(`ALTER TABLE \`a\` ADD ${kc.toUpperCase()} ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`) INVISIBLE`);
          expect(getParsedSql(`alter table a add ${kc} ${keyword} name_idx ("name", "alias") visible`))
            .to.equal(`ALTER TABLE \`a\` ADD ${kc.toUpperCase()} ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`) VISIBLE`);
          expect(getParsedSql(`alter table a add ${kc} ${keyword} name_idx ("name", "alias")`))
            .to.equal(`ALTER TABLE \`a\` ADD ${kc.toUpperCase()} ${keyword.toUpperCase()} name_idx (\`name\`, \`alias\`)`);
        })
      });
    });

    ['to', 'as'].forEach(kw => {
      it(`should support alter rename ${kw} table`, () => {
        const sql = `alter table oldTable rename ${kw} newTable`
        expect(getParsedSql(sql)).to.equal(`ALTER TABLE \`oldTable\` RENAME ${kw.toUpperCase()} \`newTable\``)
      })
    })

    it(`should support MySQL rename column`, () => {
      expect(getParsedSql('alter table a rename column id to player_id'))
        .to.equal('ALTER TABLE `a` RENAME COLUMN `id` TO `player_id`');
    });
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

  describe('unlock', () => {
    it('should support unlock tables', () => {
      expect(getParsedSql(`unlock tables`))
        .to.equal(`UNLOCK TABLES`);
    })
  })

  describe('lock', () => {
    const lockType = ['read', 'read local', 'low_priority write', 'write']
    lockType.forEach(lock_type => {
      it(`should support lock tables with ${lock_type}`, () => {
        expect(getParsedSql(`lock tables d1.t1 as ta1 ${lock_type}`))
          .to.equal(`LOCK TABLES \`d1\`.\`t1\` AS \`ta1\` ${lock_type.toUpperCase()}`);
      })
    })

    it('should support lock multiple tables', () => {
      expect(getParsedSql(`lock tables d1.t1 as ta1 read, d2.t2 t3 write`))
        .to.equal('LOCK TABLES `d1`.`t1` AS `ta1` READ, `d2`.`t2` AS `t3` WRITE');
    })

    it('should support pg lock', () => {
      const opt = {
        database: 'postgresql'
      }
      expect(getParsedSql('lock table t1, t2', opt))
        .to.equal('LOCK TABLE "t1", "t2"');
      expect(getParsedSql('lock table t1, t2 in row share mode', opt))
        .to.equal('LOCK TABLE "t1", "t2" IN ROW SHARE MODE');
      expect(getParsedSql('lock table t1, t2 in row share mode nowait', opt))
        .to.equal('LOCK TABLE "t1", "t2" IN ROW SHARE MODE NOWAIT');
    })
  })

  describe('declare', () => {
    const opt = {
      database: 'transactsql'
    }
    it('should support declare variables', () => {
      expect(getParsedSql('DECLARE @find varchar(30)', opt))
          .to.equal('DECLARE @find VARCHAR(30)');
      expect(getParsedSql("DECLARE @find varchar(30) = 'Man%'", opt))
          .to.equal("DECLARE @find VARCHAR(30) = 'Man%'");
      expect(getParsedSql('DECLARE @Group nvarchar(50), @Sales money', opt))
          .to.equal('DECLARE @Group NVARCHAR(50), @Sales MONEY');
    })

    it('should support declare variables', () => {
      const ast = parser.astify('DECLARE @find varchar(30)', opt);
      ast.declare[0].keyword = null
      expect(parser.sqlify(ast, opt)).to.equal('DECLARE @find')
    })

    it('should support declare cursor', () => {
      expect(getParsedSql('DECLARE @find CURSOR', opt))
          .to.equal('DECLARE @find CURSOR');
    })

    it('should support declare table', () => {
      expect(getParsedSql(`DECLARE @MyTableVar table(
        EmpID int NOT NULL,
        OldVacationHours int,
        NewVacationHours int,
        ModifiedDate datetime);`, opt))
          .to.equal('DECLARE @MyTableVar TABLE ([EmpID] INT NOT NULL, [OldVacationHours] INT, [NewVacationHours] INT, [ModifiedDate] DATETIME)');
    })

    it('should support declare with other sql', () => {
      expect(getParsedSql(`DECLARE @QuizID BIGINT;
      INSERT INTO quiz
      (name, max_attempts, num_questions, passing_score)
      VALUES ('Class Quiz', 3, 10, 70);
      SELECT @QuizID = (SELECT SCOPE_IDENTITY());`, opt))
          .to.equal("DECLARE @QuizID BIGINT ; INSERT INTO [quiz] ([name], [max_attempts], [num_questions], [passing_score]) VALUES ('Class Quiz',3,10,70) ; SELECT @QuizID = (SELECT SCOPE_IDENTITY())");
    })
  })

  describe('drop', () => {
    it('should support drop index', () => {
      expect(getParsedSql('DROP INDEX IX_NAME ON TABLE_NAME;')).to.equal('DROP INDEX `IX_NAME` ON `TABLE_NAME`')
      expect(getParsedSql('DROP INDEX abc.IX_NAME ON TABLE_NAME algorithm inplace;')).to.equal('DROP INDEX `abc`.`IX_NAME` ON `TABLE_NAME` ALGORITHM INPLACE')
      expect(getParsedSql('DROP INDEX abc.IX_NAME ON TABLE_NAME algorithm = copy lock SHARED;')).to.equal('DROP INDEX `abc`.`IX_NAME` ON `TABLE_NAME` ALGORITHM = COPY LOCK SHARED')
    })

    it('should support drop index for tsql', () => {
      const opt = { database: 'transactsql' }
      expect(getParsedSql('DROP INDEX IX_NAME ON TABLE_NAME;', opt)).to.equal('DROP INDEX [IX_NAME] ON [TABLE_NAME]')
      expect(getParsedSql('DROP INDEX abc.IX_NAME ON TABLE_NAME algorithm inplace;', opt)).to.equal('DROP INDEX [abc].[IX_NAME] ON [TABLE_NAME] ALGORITHM INPLACE')
      expect(getParsedSql('DROP INDEX abc.IX_NAME ON TABLE_NAME algorithm = copy lock SHARED;', opt)).to.equal('DROP INDEX [abc].[IX_NAME] ON [TABLE_NAME] ALGORITHM = COPY LOCK SHARED')
    })
  })

  describe('go', () => {
    it(`should support go`, () => {
      expect(getParsedSql('use abc go')).to.equal('USE `abc` GO');
      expect(getParsedSql('use abc; select * from abc go update abc set id = 1')).to.equal('USE `abc` ; SELECT * FROM `abc` GO UPDATE `abc` SET `id` = 1');
    });

    it(`should support multiple go`, () => {
      expect(getParsedSql('use abc; select * from abc go update abc set id = 1 go select id from abc')).to.equal('USE `abc` ; SELECT * FROM `abc` GO UPDATE `abc` SET `id` = 1 GO SELECT `id` FROM `abc`');
    });
  })
})