'use strict';

const { expect } = require('chai');
const { Parser } = require('../');

describe('update', () => {
    const parser = new Parser();

    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('UPDATE a set id = 1');
      expect(tableList).to.eql(["update::null::a"]);
      expect(columnList).to.eql([]);
      expect(ast.type).to.be.eql('update');
      expect(ast.db).to.be.null;
      expect(ast.table).to.be.eql('a');
      expect(ast.set).to.eql([{
        column: 'id',
        value: {
          type: 'number',
          value: 1
        }
      }]);
      expect(ast.where).to.be.null;
    });

    it('should parse function expression', () => {
      const { tableList, columnList, ast } = parser.parse("UPDATE t SET col1 = concat(name, '名字')");
      expect(tableList).to.eql(["update::null::t"]);
      expect(columnList).to.eql([]);
      expect(ast.type).to.be.eql('update');
      expect(ast.db).to.be.null;
      expect(ast.table).to.be.eql('t');
      expect(ast.set).to.eql([
        {
          column: "col1",
          value: {
            type: "function",
            name: "concat",
            args: {
              type: "expr_list",
              value: [
                {
                  type: "column_ref",
                  table: null,
                  column: "name"
                },
                {
                  type: "string",
                  value: "名字"
                }
              ]
            }
          }
        }
     ]);
    expect(ast.where).to.be.null;
    });
});
