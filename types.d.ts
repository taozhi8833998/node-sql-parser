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
export interface TableExpr {
  expr: {
    tableList: string[];
    columnList: string[];
    ast: Select;
    parentheses: boolean;
  };
  as: string | null;
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

export interface ValueExpr<T = string | number | boolean> {
  type:
    | "backticks_quote_string"
    | "string"
    | "number"
    | "regex_string"
    | "hex_string"
    | "full_hex_string"
    | "natural_string"
    | "bit_string"
    | "double_quote_string"
    | "single_quote_string"
    | "boolean"
    | "bool"
    | "null"
    | "star"
    | "param"
    | "origin"
    | "date"
    | "datetime"
    | "default"
    | "time"
    | "timestamp"
    | "var_string";
  value: T;
}

export type SortDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

export interface ColumnRefItem {
  type: "column_ref";
  table?: string | null;
  column: string | { expr: ValueExpr };
  options?: ExprList;
  loc?: LocationRange;
  collate?: CollateExpr | null;
  order_by?: SortDirection | null;
}
export type ColumnRef = ColumnRefItem;
export interface SetList {
  column: string;
  value: ExpressionValue;
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
  expr: null;
  args: Array<
    | {
        cond: Binary;
        result: ExpressionValue;
        type: "when";
      }
    | {
        result: ExpressionValue;
        type: "else";
      }
  >;
}
export interface Cast {
  type: "cast";
  keyword: "cast";
  expr: ExpressionValue;
  symbol: "as";
  target: {
    dataType: string;
    quoted?: string;
  }[];
}
export interface AggrFunc {
  type: "aggr_func";
  name: string;
  args: {
    expr: ExpressionValue;
    distinct?: "DISTINCT" | null;
    orderby?: OrderBy[] | null;
    parentheses?: boolean;
    separator?: { keyword: string; value: Value } | string | null;
  };
  loc?: LocationRange;
  over: { type: 'window'; as_window_specification: AsWindowSpec } | null;
}

export type FunctionName = {
  schema?: { value: string; type: string };
  name: ValueExpr<string>[];
};
export interface Function {
  type: "function";
  name: FunctionName;
  args?: ExprList;
  suffix?: OnUpdateCurrentTimestamp | null;
  over?: { type: 'window'; as_window_specification: AsWindowSpec } | null;
  loc?: LocationRange;
}
export interface Column {
  expr: ExpressionValue;
  as: ValueExpr<string> | string | null;
  type?: string;
  loc?: LocationRange;
}

export interface Interval {
  type: "interval";
  unit: string;
  expr: ValueExpr & { loc?: LocationRange };
}

export type Param = { type: "param"; value: string; loc?: LocationRange };

export type Var = { type: "var"; name: string; members: string[]; prefix: string; loc?: LocationRange };

export type Value = { type: string; value: string | number | boolean | null; loc?: LocationRange };

export type Binary = {
  type: "binary_expr";
  operator: string;
  left: ExpressionValue | ExprList;
  right: ExpressionValue | ExprList;
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

export type ExpressionValue =
  | ColumnRef
  | Param
  | Var
  | Function
  | Case
  | AggrFunc
  | Value
  | Binary
  | Unary
  | Cast
  | Interval
  | Star
  | TableColumnAst;

export type ExprList = {
  type: "expr_list";
  value: ExpressionValue[] | null;
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

export type WindowFrameClause = Binary;

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
  options: ValueExpr<string>[] | null;
  distinct: "DISTINCT" | null;
  columns: Column[];
  into: {
    keyword?: string;
    type?: string;
    expr?: Var[] | Value;
    position: 'column' | 'from' | 'end' | null;
  };
  from: From[] | TableExpr | { expr: From[], parentheses: { length: number }, joins: From[] } | null;
  where: Binary | Unary | Function | null;
  groupby: { columns: ColumnRef[] | null, modifiers: (ValueExpr<string> | null)[] } | null;
  having: Binary | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  window: WindowExpr | null;
  qualify?: Binary[] | null;
  _orderby?: OrderBy[] | null;
  _limit?: Limit | null;
  parentheses_symbol?: boolean;
  _parentheses?: boolean;
  loc?: LocationRange;
  _next?: Select;
  set_op?: string;
  collate: CollateExpr | null;
  locking_read: {
    type: 'for_update' | 'lock_in_share_mode';
    of_tables?: From[];
    wait?: 'nowait' | 'skip_locked' | null;
  } | null;
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
  prefix: string;
  on_duplicate_update: {
    keyword: "on duplicate key update",
    set: SetList[];
  } | null;
  loc?: LocationRange;
  returning?: Returning
}
export interface Returning {
  type: 'returning';
  columns: Column[];
}
export interface Update {
  with: With[] | null;
  type: "update";
  table: Array<From | Dual> | null;
  set: SetList[];
  where: Binary | Unary | Function | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  loc?: LocationRange;
  returning?: Returning
}
export interface Delete {
  with: With[] | null;
  type: "delete";
  table: (From & { addition?: boolean })[] | null;
  from: Array<From | Dual>;
  where: Binary | Unary | Function | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  loc?: LocationRange;
  returning?: Returning
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
  | AlterAddPartition
  | AlterDropPartition
  | AlterAlgorithm
  | AlterLock
  | AlterTableOption;

export type AlterAddColumn = {
  type: 'alter';
  resource: 'column';
  action: 'add';
  keyword?: 'COLUMN';
  column: ColumnRef;
  definition: DataType;
  suffix: string | null | { keyword: string };
};

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
  suffix: string | null | { keyword: string };
};

export type AlterChangeColumn = {
  type: 'alter';
  resource: 'column';
  action: 'change';
  keyword: 'COLUMN' | null;
  old_column: ColumnRef;
  column: ColumnRef;
  definition: DataType;
  suffix: string | null | { keyword: string };
};

export type AlterRenameTable = {
  type: 'alter';
  resource: 'table';
  action: 'rename';
  keyword: string;
  table: string;
};

export type AlterRenameColumn = {
  type: 'alter';
  resource: 'column';
  action: 'rename';
  keyword: 'column';
  old_column: ColumnRef;
  prefix: string;
  column: ColumnRef;
};

export type AlterAddIndex = {
  type: 'alter';
  resource: 'index';
  action: 'add';
  keyword: string;
  index: string;
  definition: ColumnRef[];
  index_type: IndexType | null;
  index_options: IndexOption[] | null;
};

export type AlterDropIndex = {
  type: 'alter';
  resource: 'index';
  action: 'drop';
  keyword: string;
  index: string;
};

export type AlterDropKey = {
  type: 'alter';
  resource: 'key';
  action: 'drop';
  keyword: string;
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
  keyword: string;
  constraint: string;
};

export type AlterAddPartition = {
  type: 'alter';
  resource: 'partition';
  action: 'add';
  keyword: 'PARTITION';
  partitions: Array<{
    name: ValueExpr;
    value: {
      type: string;
      expr: Value;
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

export type AlterAlgorithm = {
  type: 'alter';
  resource: 'algorithm';
  keyword: 'algorithm';
  symbol: string;
  algorithm: string;
};

export type AlterLock = {
  type: 'alter';
  resource: 'lock';
  keyword: 'lock';
  symbol: string;
  lock: string;
};

export type AlterTableOption = {
  type: 'alter';
  resource: string;
  keyword: string;
  symbol: string;
  engine?: string;
};

export interface Use {
  type: "use";
  db: string;
  loc?: LocationRange;
}

export type Timezone = ["WITHOUT" | "WITH", "TIME", "ZONE"];

export type KeywordComment = {
  type: "comment";
  keyword: "comment";
  symbol?: "=" | null;
  value: ValueExpr | string;
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

export type DataType = {
  dataType: string;
  length?: number;
  parentheses?: true;
  scale?: number;
  suffix?: Timezone | ("UNSIGNED" | "ZEROFILL")[] | OnUpdateCurrentTimestamp | null;
  array?: "one" | "two";
  expr?: Expr | ExprList;
  quoted?: string;
};

export type OnUpdateCurrentTimestamp = {
  type: 'on_update_current_timestamp';
  keyword: 'on update';
  expr: Function;
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
  primary?: "key" | "primary key";
  comment?: KeywordComment;
  collate?: CollateExpr;
  column_format?: { type: string; value: string };
  storage?: { type: string; value: string };
  reference_definition?: ReferenceDefinition;
  character_set?: { type: "CHARACTER SET"; value: ValueExpr; symbol: "=" | null };
  check?: {
    type: 'check';
    expr: Binary;
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
  keyword?: string;
  match?: string | null;
  on_action: OnReference[];
};

export type OnReference = {
  type: 'on update' | 'on delete' | 'on_reference';
  keyword?: 'on delete' | 'on update';
  value: 'restrict' | 'cascade' | 'set null' | 'no action' | 'set default' | ValueExpr;
};

export type CreateColumnDefinition = {
  column: ColumnRef;
  definition: DataType;
  resource: "column";
} & ColumnDefinitionOptList;

export type IndexType = {
  keyword: "using";
  type: "btree" | "hash" | "gist" | "gin";
};

export type IndexOption = {
  type: "key_block_size";
  symbol?: "=";
  expr: Value;
} | {
  keyword: "using";
  type: "btree" | "hash";
};

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
  table: { db: string | null; table: string }[] | { db: string | null, table: string };
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

export interface CreateDatabase {
  type: "create";
  keyword: "database";
  if_not_exists?: "IF NOT EXISTS" | null;
  database?: string | { schema: ValueExpr[] };
  loc?: LocationRange;
}

export interface CreateSchema {
  type: "create";
  keyword: "schema";
  if_not_exists?: "IF NOT EXISTS" | null;
  database?: string | { schema: ValueExpr[] };
  loc?: LocationRange;
}

export interface CreateIndex {
  type: "create";
  keyword: "index";
  index_using?: {
    keyword: "using";
    type: "btree" | "hash";
  } | null;
  index?: string | null | { schema: string | null, name: string};
  on_kw?: "on" | null;
  table?: { db: string | null; table: string }[] | { db: string | null, table: string };
  index_columns?: ColumnRefItem[] | null;
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
  replace?: boolean | null;
  algorithm?: 'undefined' | 'merge' | 'temptable' | null;
  definer?: Binary | null;
  sql_security?: 'definer' | 'invoker' | null;
  view?: { db: string | null; view: string } | From | null;
  columns?: string[] | null;
  select?: Select | null;
  with?: 'cascaded' | 'local' | null;
  loc?: LocationRange;
}

export interface CreateTrigger {
  type: "create";
  keyword: "trigger";
  definer?: Binary | null;
  trigger?: { db: string | null; table: string };
  time?: string;
  events?: TriggerEvent[] | null;
  table?: { db: string | null; table: string }[] | { db: string | null, table: string };
  for_each?: { keyword: string; args: string } | 'row' | 'statement' | null;
  order?: {
    keyword: 'FOLLOWS' | 'PRECEDES';
    trigger: string;
  } | null;
  execute?: { type: "set"; expr: SetList[] } | SetList[] | null;
  loc?: LocationRange;
}

export interface CreateUser {
  type: "create";
  keyword: "user";
  if_not_exists?: "IF NOT EXISTS" | null;
  user?: UserAuthOption[] | null;
  default_role?: string[] | null;
  require?: RequireOption | null;
  resource_options?: ResourceOption | null;
  password_options?: PasswordOption | null;
  lock_option_user?: 'account lock' | 'account unlock' | null;
  comment_user?: string | null;
  attribute?: string | null;
  loc?: LocationRange;
}

export type Create = CreateTable | CreateDatabase | CreateSchema | CreateIndex | CreateView | CreateTrigger | CreateUser;

export type TriggerEvent = {
  keyword: 'insert' | 'update' | 'delete';
  args?: ColumnRef[];
};

export type UserAuthOption = {
  user: {
    name: ValueExpr;
    host: ValueExpr;
  };
  auth_option?: {
    keyword: string;
    auth_plugin?: string | null;
    value: ValueExpr & { prefix?: string };
  } | null;
};

export type RequireOption = {
  keyword: 'require';
  value: ValueExpr;
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
  type: 'password_expire' | 'password_history' | 'password_reuse_interval' | 'password_require_current';
  value: number | string | null;
};

export type TableOption = {
  keyword: string;
  symbol?: '=';
  value: ExpressionValue | string | number;
};

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
  options: 'restrict' | 'cascade' | null;
  loc?: LocationRange;
}

export interface DropIndex {
  type: "drop";
  keyword: "index";
  name: ColumnRef;
  table: From;
  options: 'restrict' | 'cascade' | null;
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

export interface Show {
  type: "show";
  keyword: string;
  suffix?: string;
  from?: From;
  where?: Binary | Function | null;
  like?: {
    type: 'like';
    value: string;
  } | null;
  loc?: LocationRange;
}

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

export interface Set {
  type: "set";
  keyword?: string | null;
  expr: Array<{
    type: "assign";
    left: Var;
    symbol: string;
    right: ExpressionValue;
  }>;
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
  keyword: "priv";
  objects: Array<{
    priv: ValueExpr;
    columns: ColumnRef[] | null;
  }>;
  on: {
    object_type: 'table' | 'function' | 'procedure' | null;
    priv_level: Array<{
      prefix: string;
      name: string;
    }>;
  };
  to_from: "TO" | "FROM";
  user_or_roles: Array<{
    name: ValueExpr;
    host: ValueExpr | null;
  }>;
  with: any | null;
  loc?: LocationRange;
}

export interface LoadData {
  type: "load_data";
  mode?: string | null;
  local?: 'local' | null;
  file: ValueExpr;
  replace_ignore?: 'replace' | 'ignore' | null;
  table: { db: string | null; table: string };
  partition?: ValueExpr<string>[] | null;
  character_set?: string | null;
  fields?: LoadDataField | null;
  lines?: LoadDataLine | null;
  ignore?: number | null;
  column?: ColumnRef[] | null;
  set?: SetList[] | null;
  loc?: LocationRange;
}

export type LoadDataField = {
  keyword: 'FIELDS';
  terminated: ValueExpr & { prefix: string } | null;
  enclosed: ValueExpr & { prefix: string } | null;
  escaped: ValueExpr & { prefix: string } | null;
};

export type LoadDataLine = {
  keyword: 'LINES';
  starting?: ValueExpr & { prefix: string };
  terminated: ValueExpr & { prefix: string } | null;
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
    action: ValueExpr<"start" | "begin" | "commit" | "rollback" | "START" | "COMMIT" | "ROLLBACK">;
    keyword?: "TRANSACTION";
    modes?: ValueExpr[] | null;
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
  | Set
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
