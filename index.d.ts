declare module 'node-sql-parser' {
  enum Type {
    SELECT='select',
    UPDATE='update',
    INSERT='insert',
    DELETE='delete',
    REPLACE='replace'
  }
  interface With {
    name: string,
    stmt: any[],
    columns?: any[]
  }
  enum WhilteListCheckMode {
    TABLE='table',
    COLUMN='column'
  }
  export interface TableColumnAst {
    tableList: string[],
    columnsList: string[],
    ast: AST[] | AST
  }
  interface Select {
    with?: With,
    type: Type.SELECT | Type.UPDATE | Type.INSERT | Type.DELETE | Type.REPLACE,
    options?: any[],
    distinct?: 'DISTINCT',
    columns: any[] | '*',
    from?: [],
    where?: any,
    groupby?: any[],
    having?: any[],
    orderby?: any[],
    limit?: {type: string, value: number}[]
  }

  interface Insert {

  }
  export type AST = Select | Insert
  export class Parser {
    constructor();
    parse(sql: string): TableColumnAst;
    astify(sql: string): AST[] | AST;
    sqlify(ast: AST[] | AST): string;
    whiteListCheck(sql: string, whiteList: string[], type?: WhilteListCheckMode.TABLE | WhilteListCheckMode.COLUMN): Error | undefined;
    tableList(sql: string): string[];
    columnList(sql: string): string[];
  }
}