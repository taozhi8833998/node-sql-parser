const { expect } = require('chai');
const Parser = require('../../src/parser').default

describe('MariaDB Command SQL', () => {
  const parser = new Parser();
  const opt = { database: 'mariadb' }

  function getParsedSql(sql) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  describe('alter', () => {
    const KEYWORDS = ['', 'COLUMN ', 'COLUMN IF NOT EXISTS ', 'IF NOT EXISTS ']
    it(`should support MariaDB alter add column`, () => {
      KEYWORDS.forEach(keyword => {
        expect(getParsedSql(`alter table a add ${keyword}xxx int`))
        .to.equal(`ALTER TABLE \`a\` ADD ${keyword}\`xxx\` INT`);
        expect(getParsedSql(`alter table a add ${keyword}yyy varchar(128)`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword}\`yyy\` VARCHAR(128)`);
        expect(getParsedSql(`alter table a add ${keyword}zzz varchar(128), add aaa date`))
          .to.equal(`ALTER TABLE \`a\` ADD ${keyword}\`zzz\` VARCHAR(128), ADD \`aaa\` DATE`);
      })
    });
  })
})
