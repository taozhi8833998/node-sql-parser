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
  
  describe('returning', () => {
    it('insert returning', () => {
      const sql = 'INSERT INTO `user`(`firstName`, `lastName`, `creationDate`) VALUES (?, ?, DEFAULT) RETURNING `firstName`, `lastName`, `creationDate`';
      expect(getParsedSql(sql)).to.equal('INSERT INTO `user` (firstName, lastName, creationDate) VALUES (?,?,`DEFAULT`) RETURNING `firstName`, `lastName`, `creationDate`');
    })
    
    it('replace returning', () => {
      const sql = "REPLACE INTO t2 VALUES (1,'Leopard'),(2,'Dog') RETURNING id2, id2+id2";
      expect(getParsedSql(sql)).to.equal("REPLACE INTO `t2` VALUES (1,'Leopard'), (2,'Dog') RETURNING `id2`, `id2` + `id2`");
    })
    
    it('delete returning', () => {
      const sql = "DELETE FROM t RETURNING f1";
      expect(getParsedSql(sql)).to.equal('DELETE FROM `t` RETURNING `f1`');
    })
  })
  it('should support uuid type', () => {
    const sql = 'CREATE TABLE t1 (id UUID);'
    expect(getParsedSql(sql)).to.equal('CREATE TABLE `t1` (`id` UUID)');
  })
})
