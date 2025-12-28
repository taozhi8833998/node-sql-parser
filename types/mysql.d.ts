// Type definitions for node-sql-parser 1.0
// Project: https://github.com/taozhi8833998/node-sql-parser#readme
// Definitions by: taozhi8833998 <https://github.com/taozhi8833998>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

export interface With {
  name: { value: string };
  stmt: {
    _parentheses?: boolean;
    tableList: string[];
    columnList: string[];
    ast: Select;
  };
  columns: ColumnRef[] | null;
}
import { LocationRange } from "pegjs";

export { LocationRange, Location } from "pegjs";

export interface ParseOptions {
  includeLocations?: boolean;
}
export interface Option {
  database?: string;
  type?: string;
  trimQuery?: boolean;
  parseOptions?: ParseOptions;
}
export interface TableColumnAst {
  tableList: string[];
  columnList: string[];
  ast: AST[] | AST;
  parentheses?: boolean;
  collate?: CollateExpr | null;
  loc?: LocationRange;
}
export interface BaseFrom {
  db: string | null;
  table: string;
  as: string | null;
  schema?: string;
  addition?: boolean;
  loc?: LocationRange;
}
export interface Join extends BaseFrom {
  join: "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN";
  using?: string[];
  on?: Binary;
}
export interface Values {
  type: "values";
  values: ExprList[];
  prefix?: string;
}

export interface TableExpr {
  expr: {
    tableList: string[];
    columnList: string[];
    ast: Select;
    parentheses: boolean;
  } | Values;
  as: string | null;
  prefix?: string;
}
export interface Dual {
  type: "dual";
  loc?: LocationRange;
}
export type From = BaseFrom | Join | TableExpr | Dual;
export interface LimitValue {
  type: string;
  value: number;
  loc?: LocationRange;
}
export interface Limit {
  seperator: string;
  value: LimitValue[];
  loc?: LocationRange;
}
export interface OrderBy {
  type: "ASC" | "DESC" | null;
  expr: ExpressionValue;
  loc?: LocationRange;
}

export interface ValueExpr {
  type:
    | "single_quote_string"
    | "double_quote_string"
    | "number"
    | "bigint"
    | "bool"
    | "null"
    | "hex_string"
    | "full_hex_string"
    | "bit_string"
    | "natural_string"
    | "date"
    | "time"
    | "datetime"
    | "timestamp"
    | "param"
    | "star"
    | "origin"
    | "default";
  value: string | number | boolean | null;
  suffix?: { collate?: CollateExpr };
}

export type StringValue = {
  type: "single_quote_string" | "double_quote_string";
  value: string;
};

export type OriginValue = {
  type: "origin";
  value: string;
};

export type DefaultValue = {
  type: "default";
  value: string;
};

export type NumberValue = {
  type: "number";
  value: number;
};

export type IntervalExprValue = {
  type: "number" | "single_quote_string" | "double_quote_string";
  value: number | string;
  loc?: LocationRange;
};

export type SeparatorValue = {
  type: "single_quote_string" | "double_quote_string";
  value: string;
};

export type SortDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

export interface ColumnRefItem {
  type: "column_ref";
  table?: string | null;
  column: string;
  options?: ExprList;
  loc?: LocationRange;
  collate?: CollateExpr | null;
  order_by?: SortDirection | null;
}
export type ColumnRef = ColumnRefItem;
export interface SetList {
  column: string;
  value: ExpressionValue | ExtractFunc;
  table: string | null;
  loc?: LocationRange;
}
export interface InsertReplaceValue {
  type: "expr_list";
  value: ExpressionValue[];
  prefix: string | null;
  loc?: LocationRange;
}

export interface Star {
  type: "star";
  value: "*" | "";
  loc?: LocationRange;
}
export interface Case {
  type: "case";
  expr: ExpressionValue | null;
  args: Array<
    | {
        cond: ExpressionValue | ExprList;
        result: ExpressionValue;
        type: "when";
      }
    | {
        result: ExpressionValue;
        type: "else";
      }
  >;
  collate?: CollateExpr | null;
}
export interface Cast {
  type: "cast";
  keyword: "cast";
  expr: ExpressionValue;
  symbol: "as";
  target: {
    dataType: MysqlType | "SIGNED" | "UNSIGNED" | "SIGNED INTEGER" | "UNSIGNED INTEGER";
    quoted?: string;
  }[];
  collate?: CollateExpr | null;
}
export interface AggrFunc {
  type: "aggr_func";
  name: string;
  args: {
    expr: ExpressionValue | Star;
    distinct?: "DISTINCT" | null;
    orderby?: OrderBy[] | null;
    parentheses?: boolean;
    separator?: { keyword: string; value: SeparatorValue } | string | null;
  };
  loc?: LocationRange;
  over: { type: 'window'; as_window_specification: AsWindowSpec } | null;
}

export type FunctionNameValue = {
  type: "origin" | "default" | "backticks_quote_string";
  value: string;
};

export type FunctionName = {
  schema?: { value: string; type: string };
  name: FunctionNameValue[];
};
export interface Function {
  type: "function";
  name: FunctionName;
  args?: ExprList | null;
  over?: { type: 'window'; as_window_specification: AsWindowSpec } | OnUpdateCurrentTimestamp | null;
  collate?: CollateExpr | null;
  loc?: LocationRange;
}
export interface FulltextSearch {
  type: "fulltext_search";
  match: "match";
  columns: ColumnRef[];
  against: "against";
  expr: ExpressionValue;
  mode: { type: "origin"; value: string } | null;
  as?: string | null;
}
export interface Column {
  expr: ExpressionValue | ExtractFunc | Star | FulltextSearch | Assign;
  as: string | null;
  type?: string;
  loc?: LocationRange;
}

export interface Interval {
  type: "interval";
  unit: string;
  expr: IntervalExprValue;
  collate?: CollateExpr | null;
}

export type Param = { type: "param"; value: string; loc?: LocationRange };

export type Var = { type: "var"; name: string; members: string[]; prefix: string; loc?: LocationRange };

export type Assign = {
  type: "assign";
  left: Var;
  symbol: ":=";
  right: ExpressionValue;
  loc?: LocationRange;
};

export type Binary = {
  type: "binary_expr";
  operator: string;
  left: ExpressionValue | ExprList | ExtractFunc;
  right: ExpressionValue | ExprList | ExtractFunc;
  loc?: LocationRange;
  parentheses?: boolean;
};

export type Unary = {
  type: "unary_expr";
  operator: string;
  expr: ExpressionValue;
  loc?: LocationRange;
  parentheses?: boolean;
};

export type Expr = Binary | Unary;

export interface ExtractFunc {
  type: "extract";
  args: {
    field: string;
    source: ExpressionValue;
  };
  loc?: LocationRange;
}

export type ExpressionValue =
  | ColumnRef
  | Param
  | Var
  | Function
  | Case
  | AggrFunc
  | ValueExpr
  | Binary
  | Unary
  | Cast
  | Interval
  | TableColumnAst;

export type ExprList = {
  type: "expr_list";
  value: (ExpressionValue | ConvertDataType | ExprList)[] | null;
  loc?: LocationRange;
  parentheses?: boolean;
  separator?: string;
};

export type PartitionBy = Column[];

export type WindowSpec = {
  name: string | null;
  partitionby: PartitionBy | null;
  orderby: OrderBy[] | null;
  window_frame_clause: WindowFrameClause | null;
};

export type WindowFrameClause = Binary | { type: "rows"; expr: OriginValue | { type: "number"; value: string } };

export type AsWindowSpec = string | { window_specification: WindowSpec; parentheses: boolean };

export type NamedWindowExpr = {
  name: string;
  as_window_specification: AsWindowSpec;
};

export type WindowExpr = {
  keyword: 'window';
  type: 'window',
  expr: NamedWindowExpr[];
};

export interface Select {
  with: With[] | null;
  type: "select";
  options: ("SQL_CALC_FOUND_ROWS" | "SQL_CACHE" | "SQL_NO_CACHE" | "SQL_SMALL_RESULT" | "SQL_BIG_RESULT" | "SQL_BUFFER_RESULT")[] | null;
  distinct: "DISTINCT" | null;
  columns: Column[];
  into: {
    keyword?: string;
    type?: string;
    expr?: Var[] | StringValue;
    position: 'column' | 'from' | 'end' | null;
  };
  from: From[] | TableExpr | { expr: From[], parentheses: { length: number }, joins: From[] } | null;
  where: Binary | Unary | Function | FulltextSearch | ColumnRef | null;
  groupby: { columns: ExpressionValue[] | null, modifiers: (OriginValue | null)[] } | null;
  having: Binary | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  window: WindowExpr | null;
  _orderby?: OrderBy[] | null;
  _limit?: Limit | null;
  parentheses_symbol?: boolean;
  _parentheses?: boolean;
  loc?: LocationRange;
  _next?: Select;
  set_op?: string;
  collate: CollateExpr | null;
  locking_read: string | null;
}
export interface Insert_Replace {
  type: "replace" | "insert";
  table: From[] | From;
  columns: string[] | null;
  values?: {
    type: 'values',
    values: InsertReplaceValue[]
  } | Select;
  set?: SetList[];
  partition: string[] | null;
  prefix: "" | "ignore" | "into" | "ignore into";
  on_duplicate_update: {
    keyword: "on duplicate key update",
    set: SetList[];
  } | null;
  loc?: LocationRange;
}
export interface Update {
  with: With[] | null;
  type: "update";
  table: Array<From | Dual> | null;
  set: SetList[];
  where: Binary | Unary | Function | FulltextSearch | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  loc?: LocationRange;
}
export interface Delete {
  with: With[] | null;
  type: "delete";
  table: (From & { addition?: boolean })[] | null;
  from: Array<From | Dual>;
  where: Binary | Unary | Function | FulltextSearch | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  loc?: LocationRange;
}

export interface Alter {
  type: "alter";
  table: Array<{ db: string | null; table: string }>;
  expr: AlterExpr[];
  loc?: LocationRange;
}

export type AlterExpr = 
  | AlterAddColumn
  | AlterDropColumn
  | AlterModifyColumn
  | AlterChangeColumn
  | AlterRenameTable
  | AlterRenameColumn
  | AlterAddIndex
  | AlterDropIndex
  | AlterDropKey
  | AlterAddConstraint
  | AlterDropConstraint
  | AlterEnableConstraint
  | AlterDisableConstraint
  | AlterAddPartition
  | AlterDropPartition
  | AlterOperatePartition
  | AlterAlgorithm
  | AlterLock
  | AlterTableOption;

export type AlterColumnPosition = { keyword: string } | { keyword: string; expr: ColumnRef };

export type AlterAddColumn = {
  type: 'alter';
  resource: 'column';
  action: 'add';
  keyword?: 'COLUMN';
  column: ColumnRef;
  definition: DataType;
  suffix: AlterColumnPosition | null;
} & Partial<ColumnDefinitionOptList>;

export type AlterDropColumn = {
  type: 'alter';
  resource: 'column';
  action: 'drop';
  keyword?: 'COLUMN';
  column: ColumnRef;
};

export type AlterModifyColumn = {
  type: 'alter';
  resource: 'column';
  action: 'modify';
  keyword: 'COLUMN' | null;
  column: ColumnRef;
  definition: DataType;
  suffix: AlterColumnPosition | null;
} & Partial<ColumnDefinitionOptList>;

export type AlterChangeColumn = {
  type: 'alter';
  resource: 'column';
  action: 'change';
  keyword: 'COLUMN' | null;
  old_column: ColumnRef;
  column: ColumnRef;
  definition: DataType;
  suffix: AlterColumnPosition | null;
} & Partial<ColumnDefinitionOptList>;

export type AlterRenameTable = {
  type: 'alter';
  resource: 'table';
  action: 'rename';
  keyword: 'to' | 'as' | null;
  table: string;
};

export type AlterRenameColumn = {
  type: 'alter';
  resource: 'column';
  action: 'rename';
  keyword: 'column';
  old_column: ColumnRef;
  prefix: 'to' | 'as';
  column: ColumnRef;
};

export type AlterAddIndex = {
  type: 'alter';
  resource: 'index';
  action: 'add';
  keyword: "index" | "key" | "fulltext" | "spatial" | "fulltext key" | "spatial key" | "fulltext index" | "spatial index";
  index: string;
  definition: ColumnRef[];
  index_type?: IndexType | null;
  index_options: IndexOption[] | null;
};

export type AlterDropIndex = {
  type: 'alter';
  resource: 'index';
  action: 'drop';
  keyword: 'index' | 'key';
  index: string;
};

export type AlterDropKey = {
  type: 'alter';
  resource: 'key';
  action: 'drop';
  keyword: 'primary key' | 'foreign key' | 'key';
  key: string;
};

export type AlterAddConstraint = {
  type: 'alter';
  resource: 'constraint';
  action: 'add';
  create_definitions: CreateConstraintDefinition;
};

export type AlterDropConstraint = {
  type: 'alter';
  resource: 'constraint';
  action: 'drop';
  keyword: 'constraint' | 'check';
  constraint: string;
};

export type AlterEnableConstraint = {
  type: 'alter';
  resource: 'constraint';
  action: 'with';
  keyword: 'check check';
  constraint: string;
};

export type AlterDisableConstraint = {
  type: 'alter';
  resource: 'constraint';
  action: 'nocheck';
  constraint: string;
};

export type AlterAddPartition = {
  type: 'alter';
  resource: 'partition';
  action: 'add';
  keyword: 'PARTITION';
  partitions: Array<{
    name: DefaultValue;
    value: {
      type: 'less than';
      expr: NumberValue;
      parentheses: boolean;
    };
  }>;
};

export type AlterDropPartition = {
  type: 'alter';
  resource: 'partition';
  action: 'drop';
  keyword: 'PARTITION';
  partitions: Column[];
};

export type AlterOperatePartition = {
  type: 'alter';
  resource: 'partition';
  action: 'analyze' | 'check' | 'truncate' | 'discard' | 'import' | 'coalesce';
  keyword: 'PARTITION';
  partitions: Column[];
};

export type AlterAlgorithm = {
  type: 'alter';
  resource: 'algorithm';
  keyword: 'algorithm';
  symbol: '=' | null;
  algorithm: string;
};

export type AlterLock = {
  type: 'alter';
  resource: 'lock';
  keyword: 'lock';
  symbol: '=' | null;
  lock: string;
};

export type AlterTableOption = 
  | { type: 'alter'; resource: 'engine'; keyword: 'engine'; symbol: '=' | null; engine: string }
  | { type: 'alter'; resource: 'auto_increment'; keyword: 'auto_increment'; symbol: '=' | null; auto_increment: number }
  | { type: 'alter'; resource: 'avg_row_length'; keyword: 'avg_row_length'; symbol: '=' | null; avg_row_length: number }
  | { type: 'alter'; resource: 'key_block_size'; keyword: 'key_block_size'; symbol: '=' | null; key_block_size: number }
  | { type: 'alter'; resource: 'max_rows'; keyword: 'max_rows'; symbol: '=' | null; max_rows: number }
  | { type: 'alter'; resource: 'min_rows'; keyword: 'min_rows'; symbol: '=' | null; min_rows: number }
  | { type: 'alter'; resource: 'stats_sample_pages'; keyword: 'stats_sample_pages'; symbol: '=' | null; stats_sample_pages: number }
  | { type: 'alter'; resource: 'checksum'; keyword: 'checksum'; symbol: '=' | null; checksum: string }
  | { type: 'alter'; resource: 'delay_key_write'; keyword: 'delay_key_write'; symbol: '=' | null; delay_key_write: string }
  | { type: 'alter'; resource: 'comment'; keyword: 'comment'; symbol: '=' | null; comment: string }
  | { type: 'alter'; resource: 'compression'; keyword: 'compression'; symbol: '=' | null; compression: string }
  | { type: 'alter'; resource: 'connection'; keyword: 'connection'; symbol: '=' | null; connection: string }
  | { type: 'alter'; resource: 'data directory'; keyword: 'data directory'; symbol: '=' | null; 'data directory': string }
  | { type: 'alter'; resource: 'index directory'; keyword: 'index directory'; symbol: '=' | null; 'index directory': string }
  | { type: 'alter'; resource: 'engine_attribute'; keyword: 'engine_attribute'; symbol: '=' | null; engine_attribute: string }
  | { type: 'alter'; resource: 'secondary_engine_attribute'; keyword: 'secondary_engine_attribute'; symbol: '=' | null; secondary_engine_attribute: string }
  | { type: 'alter'; resource: 'row_format'; keyword: 'row_format'; symbol: '=' | null; row_format: string }
  | { type: 'alter'; resource: 'charset'; keyword: 'charset'; symbol: '=' | null; charset: DefaultValue }
  | { type: 'alter'; resource: 'character set'; keyword: 'character set'; symbol: '=' | null; 'character set': DefaultValue }
  | { type: 'alter'; resource: 'default charset'; keyword: 'default charset'; symbol: '=' | null; 'default charset': DefaultValue }
  | { type: 'alter'; resource: 'default character set'; keyword: 'default character set'; symbol: '=' | null; 'default character set': DefaultValue }
  | { type: 'alter'; resource: 'collate'; keyword: 'collate'; symbol: '=' | null; collate: DefaultValue }
  | { type: 'alter'; resource: 'default collate'; keyword: 'default collate'; symbol: '=' | null; 'default collate': DefaultValue };

export interface Use {
  type: "use";
  db: string;
  loc?: LocationRange;
}

export type KeywordComment = {
  type: "comment";
  keyword: "comment";
  symbol?: "=" | null;
  value: StringValue | string;
};

export type CollateExpr = {
  type: "collate";
  keyword?: "collate";
  symbol?: "=" | null;
  value?: string;
  collate?: {
    name: string;
    symbol: "=" | null;
  };
  name?: string;
};

export type MysqlType =
  | "CHAR" | "VARCHAR"
  | "BINARY" | "VARBINARY"
  | "TINYTEXT" | "TEXT" | "MEDIUMTEXT" | "LONGTEXT"
  | "TINYBLOB" | "BLOB" | "MEDIUMBLOB" | "LONGBLOB"
  | "TINYINT" | "SMALLINT" | "MEDIUMINT" | "INT" | "INTEGER" | "BIGINT"
  | "FLOAT" | "DOUBLE" | "DECIMAL" | "NUMERIC"
  | "BIT"
  | "DATE" | "TIME" | "DATETIME" | "TIMESTAMP" | "YEAR"
  | "BOOLEAN"
  | "JSON"
  | "ENUM" | "SET"
  | "GEOMETRY" | "POINT" | "LINESTRING" | "POLYGON"
  | "MULTIPOINT" | "MULTILINESTRING" | "MULTIPOLYGON" | "GEOMETRYCOLLECTION"
  | "VECTOR";

export type ConvertDataType = {
  type: "datatype";
  dataType: MysqlType | "SIGNED" | "UNSIGNED";
  length?: number | null;
  parentheses?: true;
  scale?: number | null;
  suffix?: ("UNSIGNED" | "ZEROFILL" | "SIGNED")[] | null;
};

export type DataType = {
  dataType: MysqlType;
  length?: number | null;
  parentheses?: true;
  scale?: number | null;
  suffix?: ("UNSIGNED" | "ZEROFILL" | "SIGNED")[] | null;
  expr?: Expr | ExprList;
};

export type OnUpdateCurrentTimestamp = {
  type: 'on update';
  keyword: string;
  parentheses: boolean;
  expr?: ExprList | null;
};

export type LiteralNotNull = {
  type: "not null";
  value: "not null";
};

export type LiteralNull = { type: "null"; value: null | "null" };

export type ColumnConstraint = {
  default_val: {
    type: "default";
    value: ExpressionValue;
  };
  nullable: LiteralNotNull | LiteralNull;
};

export type ColumnDefinitionOptList = {
  nullable?: ColumnConstraint["nullable"];
  default_val?: ColumnConstraint["default_val"];
  auto_increment?: "auto_increment";
  unique?: "unique" | "unique key";
  primary_key?: "key" | "primary key";
  comment?: KeywordComment;
  collate?: CollateExpr;
  column_format?: { type: string; value: string };
  storage?: { type: string; value: string };
  reference_definition?: ReferenceDefinition;
  character_set?: { type: "CHARACTER SET"; value: DefaultValue; symbol: "=" | null };
  check?: {
    constraint_type: 'check';
    keyword: 'constraint' | null;
    constraint: string | null;
    definition: Binary[];
    enforced: 'enforced' | 'not enforced' | '';
    resource: 'constraint';
  };
  generated?: {
    type: 'generated';
    expr: ExpressionValue;
    value: string;
    storage_type?: 'stored' | 'virtual';
  };
};

export type ReferenceDefinition = {
  definition?: ColumnRef[];
  table?: From[];
  keyword?: "references";
  match?: "match full" | "match partial" | "match simple" | null;
  on_action: OnReference[];
};

export type OnReference = {
  type: 'on update' | 'on delete';
  value: OriginValue | Function;
};

export type CreateColumnDefinition = {
  column: ColumnRef;
  definition: DataType;
  resource: "column";
} & ColumnDefinitionOptList;

export type IndexType = {
  keyword: "using";
  type: "btree" | "hash";
};

export type IndexOption = {
  type: "key_block_size";
  symbol?: "=" | null;
  expr: NumberValue;
} | {
  keyword: "using";
  type: "btree" | "hash";
} | {
  type: "with parser";
  expr: string;
} | {
  type: "visible" | "invisible";
  expr: string;
} | KeywordComment;

export type CreateIndexDefinition = {
  index: string | null;
  definition: ColumnRef[];
  keyword: "index" | "key";
  index_type: IndexType | null;
  resource: "index";
  index_options: IndexOption[] | null;
};

export type CreateFulltextSpatialIndexDefinition = {
  index?: string | null;
  definition: ColumnRef[];
  keyword?:
    | "fulltext"
    | "spatial"
    | "fulltext key"
    | "spatial key"
    | "fulltext index"
    | "spatial index";
  index_options?: IndexOption[] | null;
  resource: "index";
};

export type ConstraintName = { keyword: "constraint"; constraint: string };

export type CreateConstraintPrimary = {
  constraint?: ConstraintName["constraint"] | null;
  definition: ColumnRef[];
  constraint_type: "primary key";
  keyword?: ConstraintName["keyword"] | null;
  index_type?: IndexType | null;
  resource: "constraint";
  index_options?: IndexOption[] | null;
};

export type CreateConstraintUnique = {
  constraint?: ConstraintName["constraint"] | null;
  definition: ColumnRef[];
  constraint_type: "unique key" | "unique" | "unique index";
  keyword?: ConstraintName["keyword"] | null;
  index_type?: IndexType | null;
  index?: string | null;
  resource: "constraint";
  index_options?: IndexOption[] | null;
};

export type CreateConstraintForeign = {
  constraint?: ConstraintName["constraint"] | null;
  definition: ColumnRef[];
  constraint_type: "foreign key" | "FOREIGN KEY";
  keyword?: ConstraintName["keyword"] | null;
  index?: string | null;
  resource: "constraint";
  reference_definition?: ReferenceDefinition;
};

export type CreateConstraintCheck = {
  constraint?: ConstraintName["constraint"] | null;
  definition: Binary[];
  constraint_type: "check";
  keyword?: ConstraintName["keyword"] | null;
  resource: "constraint";
  index_type?: IndexType | null;
};

export type CreateConstraintDefinition =
  | CreateConstraintPrimary
  | CreateConstraintUnique
  | CreateConstraintForeign
  | CreateConstraintCheck;

export type CreateDefinition =
  | CreateColumnDefinition
  | CreateIndexDefinition
  | CreateFulltextSpatialIndexDefinition
  | CreateConstraintDefinition;

export interface CreateTable {
  type: "create";
  keyword: "table";
  temporary: "temporary" | null;
  table: { db: string | null; table: string }[];
  if_not_exists: "IF NOT EXISTS" | null;
  like?: {
    type: "like";
    table: From[];
    parentheses?: boolean;
  } | null;
  ignore_replace?: "ignore" | "replace" | null;
  as?: string | null;
  query_expr?: Select | null;
  create_definitions?: CreateDefinition[] | null;
  table_options?: TableOption[] | null;
  loc?: LocationRange;
}

export type DatabaseOption = {
  keyword: "character set" | "collate" | "default character set" | "default collate" | "charset" | "default charset";
  symbol?: "=" | null;
  value: DefaultValue;
};

export interface CreateDatabase {
  type: "create";
  keyword: "database";
  if_not_exists?: "IF NOT EXISTS" | null;
  database?: string | { schema: DefaultValue[] };
  create_definitions?: DatabaseOption[] | null;
  loc?: LocationRange;
}

export interface CreateSchema {
  type: "create";
  keyword: "schema";
  if_not_exists?: "IF NOT EXISTS" | null;
  database?: string | { schema: DefaultValue[] };
  create_definitions?: DatabaseOption[] | null;
  loc?: LocationRange;
}

export interface CreateIndex {
  type: "create";
  keyword: "index";
  index_using?: {
    keyword: "using";
    type: "btree" | "hash";
  } | null;
  index: string;
  on_kw?: "on" | null;
  table?: { db: string | null; table: string }[] | { db: string | null, table: string };
  index_columns?: (ColumnRefItem | (Function & { order_by?: SortDirection | null }))[] | null;
  index_type?: "unique" | "fulltext" | "spatial" | null;
  index_options?: IndexOption[] | null;
  algorithm_option?: {
    type: "alter";
    keyword: "algorithm";
    resource: "algorithm";
    symbol: "=" | null;
    algorithm: string;
  } | null;
  lock_option?: {
    type: "alter";
    keyword: "lock";
    resource: "lock";
    symbol: "=" | null;
    lock: string;
  } | null;
  loc?: LocationRange;
}

export interface CreateView {
  type: "create";
  keyword: "view";
  replace: "or replace" | null;
  algorithm: "UNDEFINED" | "MERGE" | "TEMPTABLE" | null;
  definer: Binary | null;
  sql_security: "DEFINER" | "INVOKER" | null;
  view: { db: string | null; view: string };
  columns: string[] | null;
  select: Select;
  with: "with check option" | "with cascaded check option" | "with local check option" | null;
  loc?: LocationRange;
}

export interface CreateTrigger {
  type: "create";
  keyword: "trigger";
  definer: Binary | null;
  trigger: { db: string | null; table: string };
  time: string;
  events: TriggerEvent[];
  table: { db: string | null; table: string };
  for_each: { keyword: string; args: string };
  order: {
    keyword: 'FOLLOWS' | 'PRECEDES';
    trigger: string;
  } | null;
  execute: { type: "set"; expr: SetList[] };
  if_not_exists: string | null;
  loc?: LocationRange;
}

export interface CreateUser {
  type: "create";
  keyword: "user";
  if_not_exists?: "IF NOT EXISTS" | null;
  user?: UserAuthOption[] | null;
  default_role?: {
    keyword: string;
    value: Array<{
      name: StringValue;
      host: StringValue | null;
    }>;
  } | null;
  require?: RequireOption | null;
  resource_options?: ResourceOption | null;
  password_options?: PasswordOption[] | null;
  lock_option_user?: 'account lock' | 'account unlock' | null;
  comment_user?: string | null;
  attribute?: StringValue & { prefix?: string } | null;
  loc?: LocationRange;
}

export type Create = CreateTable | CreateDatabase | CreateSchema | CreateIndex | CreateView | CreateTrigger | CreateUser;

export type TriggerEvent = {
  keyword: 'insert' | 'update' | 'delete';
  args?: ColumnRef[];
};

export type UserAuthOption = {
  user: {
    name: StringValue;
    host: StringValue;
  };
  auth_option?: {
    keyword: string;
    auth_plugin?: string | null;
    value: (StringValue | OriginValue) & { prefix?: string };
  } | null;
};

export type RequireOption = {
  keyword: 'require';
  value: ((StringValue | OriginValue) & { prefix?: string }) | Binary;
};

export type ResourceOption = {
  keyword: 'with';
  value: Array<{
    type: string;
    value: number;
    prefix: string;
  }>;
};

export type PasswordOption = {
  keyword: 'password expire' | 'password history' | 'password reuse interval' | 'password reuse' | 'password require current' | 'failed_login_attempts' | 'password_lock_time';
  value: OriginValue | NumberValue | Interval;
};

export type TableOption =
  | { keyword: 'engine'; symbol?: '=' | null; value: string }
  | { keyword: 'auto_increment'; symbol?: '=' | null; value: number }
  | { keyword: 'avg_row_length'; symbol?: '=' | null; value: number }
  | { keyword: 'key_block_size'; symbol?: '=' | null; value: number }
  | { keyword: 'max_rows'; symbol?: '=' | null; value: number }
  | { keyword: 'min_rows'; symbol?: '=' | null; value: number }
  | { keyword: 'stats_sample_pages'; symbol?: '=' | null; value: number }
  | { keyword: 'checksum'; symbol?: '=' | null; value: string }
  | { keyword: 'delay_key_write'; symbol?: '=' | null; value: string }
  | { keyword: 'comment'; symbol?: '=' | null; value: string }
  | { keyword: 'compression'; symbol?: '=' | null; value: string }
  | { keyword: 'connection'; symbol?: '=' | null; value: string }
  | { keyword: 'data directory'; symbol?: '=' | null; value: string }
  | { keyword: 'index directory'; symbol?: '=' | null; value: string }
  | { keyword: 'engine_attribute'; symbol?: '=' | null; value: string }
  | { keyword: 'secondary_engine_attribute'; symbol?: '=' | null; value: string }
  | { keyword: 'row_format'; symbol?: '=' | null; value: string }
  | { keyword: 'charset' | 'character set' | 'default charset' | 'default character set'; symbol?: '=' | null; value: DefaultValue }
  | { keyword: 'collate' | 'default collate'; symbol?: '=' | null; value: DefaultValue };

export interface DropTable {
  type: "drop";
  keyword: "table";
  name: From[];
  prefix: 'if exists' | null;
  loc?: LocationRange;
}

export interface DropDatabase {
  type: "drop";
  keyword: "database" | "schema";
  name: string;
  prefix: 'if exists' | null;
  loc?: LocationRange;
}

export interface DropView {
  type: "drop";
  keyword: "view";
  name: From[];
  prefix: 'if exists' | null;
  options: Array<{ type: 'origin'; value: 'restrict' | 'cascade' }> | null;
  loc?: LocationRange;
}

export interface DropIndex {
  type: "drop";
  keyword: "index";
  name: ColumnRef;
  table: { db: string | null; table: string };
  options: Array<
    | { type: 'origin'; value: 'restrict' | 'cascade' }
    | { type: 'alter'; keyword: 'algorithm'; resource: 'algorithm'; symbol: '='; algorithm: string }
    | { type: 'alter'; keyword: 'lock'; resource: 'lock'; symbol: '='; lock: string }
  > | null;
  loc?: LocationRange;
}

export interface DropTrigger {
  type: "drop";
  keyword: "trigger";
  name: Array<{ schema: string | null; trigger: string }>;
  prefix: 'if exists' | null;
  loc?: LocationRange;
}

export type Drop = DropTable | DropDatabase | DropView | DropIndex | DropTrigger;

export interface ShowLogs {
  type: "show";
  keyword: "binary" | "master";
  suffix: "logs";
  loc?: LocationRange;
}

export interface ShowTables {
  type: "show";
  keyword: "tables";
  loc?: LocationRange;
}

export interface ShowSimple {
  type: "show";
  keyword: "triggers" | "status" | "processlist";
  loc?: LocationRange;
}

export interface ShowProcedureFunctionStatus {
  type: "show";
  keyword: "procedure" | "function";
  suffix: "status";
  loc?: LocationRange;
}

export interface ShowBinlogEvents {
  type: "show";
  keyword: "binlog";
  suffix: "events";
  in: { op: "IN" | "NOT IN"; right: ExpressionValue } | null;
  from: From[] | null;
  limit: Limit | null;
  loc?: LocationRange;
}

export interface ShowCharacterSet {
  type: "show";
  keyword: "character";
  suffix: "set";
  expr: { op: "LIKE" | "NOT LIKE"; right: ExpressionValue } | Binary | null;
  loc?: LocationRange;
}

export interface ShowCollationDatabases {
  type: "show";
  keyword: "collation" | "databases";
  expr: { op: "LIKE" | "NOT LIKE"; right: ExpressionValue } | Binary | null;
  loc?: LocationRange;
}

export interface ShowColumnsIndexes {
  type: "show";
  keyword: "columns" | "indexes" | "index";
  from: From[];
  loc?: LocationRange;
}

export interface ShowCreateTable {
  type: "show";
  keyword: "create";
  suffix: "table";
  table: { db: string | null; table: string };
  loc?: LocationRange;
}

export interface ShowCreateView {
  type: "show";
  keyword: "create";
  suffix: "view";
  view: { db: string | null; table: string };
  loc?: LocationRange;
}

export interface ShowCreateEvent {
  type: "show";
  keyword: "create";
  suffix: "event";
  event: { db: string | null; table: string };
  loc?: LocationRange;
}

export interface ShowCreateTrigger {
  type: "show";
  keyword: "create";
  suffix: "trigger";
  trigger: { db: string | null; table: string };
  loc?: LocationRange;
}

export interface ShowCreateProcedure {
  type: "show";
  keyword: "create";
  suffix: "procedure";
  procedure: { db: string | null; table: string };
  loc?: LocationRange;
}

export interface ShowGrants {
  type: "show";
  keyword: "grants";
  for: {
    user: string;
    host: string | null;
    role_list: string[] | null;
  } | null;
  loc?: LocationRange;
}

export type Show = ShowLogs | ShowTables | ShowSimple | ShowProcedureFunctionStatus | ShowBinlogEvents | ShowCharacterSet | ShowCollationDatabases | ShowColumnsIndexes | ShowCreateTable | ShowCreateView | ShowCreateEvent | ShowCreateTrigger | ShowCreateProcedure | ShowGrants;

export interface Desc {
  type: "desc";
  table: string;
  loc?: LocationRange;
}

export interface Explain {
  type: "explain";
  expr: Select | Update | Delete | Insert_Replace;
  format?: string;
  loc?: LocationRange;
}

export interface Call {
  type: "call";
  expr: Function;
  loc?: LocationRange;
}

export interface SetAssign {
  type: "assign";
  left: {
    type: "var";
    name: string;
    members: string[];
    prefix: string | null;
  };
  symbol: string;
  right: ExpressionValue | ExtractFunc | FulltextSearch;
}

export interface SetStatement {
  type: "set";
  keyword?: string | null;
  expr: SetAssign[];
  loc?: LocationRange;
}

export interface Lock {
  type: "lock";
  keyword: "tables";
  tables: LockTable[];
  loc?: LocationRange;
}

export type LockTable = {
  table: From;
  lock_type: {
    type: 'read' | 'write';
    suffix?: null;
    prefix?: null;
  };
};

export interface Unlock {
  type: "unlock";
  keyword: "tables";
  loc?: LocationRange;
}

export interface Grant {
  type: "grant";
  keyword: "priv" | "proxy" | "role";
  objects: Array<{
    priv: OriginValue | StringValue | { type: "string"; value: string } | { type: "origin"; value: [string, undefined] };
    columns?: ColumnRef[] | null;
  }>;
  on?: {
    object_type: 'table' | 'function' | 'procedure' | OriginValue | null;
    priv_level: Array<{
      prefix: string | null;
      name: string;
    }>;
  } | {
    name: StringValue;
    host: StringValue | null;
  };
  to_from: "TO" | "FROM";
  user_or_roles: Array<{
    name: StringValue;
    host: StringValue | null;
  }>;
  with?: OriginValue | null;
  loc?: LocationRange;
}

export interface LoadData {
  type: "load_data";
  mode?: string | null;
  local?: 'local' | null;
  file: StringValue;
  replace_ignore?: 'replace' | 'ignore' | null;
  table: { db: string | null; table: string };
  partition?: string[] | null;
  character_set?: [string, string[], DefaultValue] | null;
  fields?: LoadDataField | null;
  lines?: LoadDataLine | null;
  ignore?: { count: NumberValue; suffix: string } | null;
  column?: Array<{ expr: ExpressionValue | Star | ExprList; as: string | null }> | null;
  set?: SetList[] | null;
  loc?: LocationRange;
}

export type LoadDataField = {
  keyword: 'FIELDS';
  terminated: StringValue & { prefix: string } | null;
  enclosed: StringValue & { prefix: string } | null;
  escaped: StringValue & { prefix: string } | null;
};

export type LoadDataLine = {
  keyword: 'LINES';
  starting?: StringValue & { prefix: string };
  terminated: StringValue & { prefix: string } | null;
};

export interface Truncate {
  type: "truncate";
  keyword: "table";
  name: From[];
  loc?: LocationRange;
}

export interface Rename {
  type: "rename";
  table: Array<[{ db: string | null; table: string }, { db: string | null; table: string }]>;
  loc?: LocationRange;
}

export interface Transaction {
  type: "transaction";
  expr: {
    action: OriginValue;
    keyword?: "TRANSACTION";
    modes?: OriginValue[] | null;
  };
  loc?: LocationRange;
}

export type AST =
  | Use
  | Select
  | Insert_Replace
  | Update
  | Delete
  | Alter
  | Create
  | Drop
  | Show
  | Desc
  | Explain
  | Call
  | SetStatement
  | Lock
  | Unlock
  | Grant
  | LoadData
  | Truncate
  | Rename
  | Transaction;

export class Parser {
  constructor();

  parse(sql: string, opt?: Option): TableColumnAst;

  astify(sql: string, opt?: Option): AST[] | AST;

  sqlify(ast: AST[] | AST, opt?: Option): string;

  exprToSQL(ast: ExpressionValue | ExprList | OrderBy | ColumnRef, opt?: Option): string;

  whiteListCheck(
    sql: string,
    whiteList: string[],
    opt?: Option
  ): Error | undefined;

  tableList(sql: string, opt?: Option): string[];

  columnList(sql: string, opt?: Option): string[];
}
