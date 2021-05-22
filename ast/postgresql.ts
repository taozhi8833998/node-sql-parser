
/*
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔ THIS FILE HAS BEEN AUTO-GENERATED DO NOT EDIT IT ! ⛔⛔⛔⛔⛔⛔⛔⛔
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔
*/

export type start = multiple_stmt | cmd_stmt | crud_stmt;

export type cmd_stmt = drop_stmt | create_stmt | truncate_stmt | rename_stmt | call_stmt | use_stmt | alter_stmt | set_stmt | lock_stmt;

export type create_stmt = create_table_stmt | create_constraint_trigger | create_extension_stmt | create_index_stmt | create_sequence | create_db_stmt;

export type alter_stmt = alter_table_stmt;

export type crud_stmt = union_stmt | update_stmt | replace_insert_stmt | insert_no_columns_stmt | delete_stmt | cmd_stmt | proc_stmts;

// is in reality: { tableList: any[]; columnList: any[]; ast: T; }
      export type AstStatement<T> = T;

export type multiple_stmt = AstStatement<crud_stmt[]>;

export interface union_stmt_node extends select_stmt_node  {
         _next: union_stmt_node;
         union: 'union' | 'union all';
      }

export type union_stmt = AstStatement<union_stmt_node>;

export type nameOrLiteral = literal_string | { type: 'same', value: string; };

export type create_extension_stmt = {
          type: 'create';
          keyword: 'extension';
          if_not_exists?: 'if not exists';
          extension: nameOrLiteral;
          with: 'with';
          schema: nameOrLiteral;
          version: nameOrLiteral;
          from: nameOrLiteral;
        };

export type create_db_definition = create_option_character_set[];

export type create_db_stmt = {
        type: 'create',
        keyword: 'database',
        if_not_exists?: 'if not exists',
        database: string,
        create_definition?: create_db_definition
      }

export type create_db_stmt = AstStatement<create_db_stmt>;

export type create_table_stmt_node = create_table_stmt_node_simple | create_table_stmt_node_like;
      export interface create_table_stmt_node_base {
        type: 'create';
        keyword: 'table';
        temporary?: 'temporary';
        if_not_exists?: 'if not exists';
        table: table_ref_list;
      }
      export interface create_table_stmt_node_simple extends create_table_stmt_node_base{
        ignore_replace?: 'ignore' | 'replace';
        as?: 'as';
        query_expr?: union_stmt_node;
        create_definition?: create_table_definition;
        table_options?: table_options;
      }

export interface create_table_stmt_node_like extends create_table_stmt_node_base{
        like: create_like_table;
      }

export type create_table_stmt = AstStatement<create_table_stmt_node> | AstStatement<create_table_stmt_node>;;

export type create_sequence_stmt = {
        type: 'create',
        keyword: 'sequence',
        temporary?: 'temporary' | 'temp',
        if_not_exists?: 'if not exists',
        table: table_ref_list,
        create_definition?: create_sequence_definition_list
      }

export type create_sequence = AstStatement<create_sequence_stmt>;

export type sequence_definition = { "resource": "sequence", prefix?: string,value: literal | column_ref }

export type sequence_definition_increment = sequence_definition;

export type sequence_definition_minval = sequence_definition;

export type sequence_definition_maxval = sequence_definition;

export type sequence_definition_start = sequence_definition;

export type sequence_definition_cache = sequence_definition;

export type sequence_definition_cycle = sequence_definition;

export type sequence_definition_owned = sequence_definition;

export type create_sequence_definition = sequence_definition_increment | sequence_definition_minval | sequence_definition_maxval | sequence_definition_start | sequence_definition_cache | sequence_definition_cycle | sequence_definition_owned;

export type create_sequence_definition_list = create_sequence_definition[];

export interface create_index_stmt_node {
      type: 'create';
      index_type?: 'unique';
      keyword: 'index';
      concurrently?: 'concurrently';
      index: string;
      on_kw: string;
      table: table_name;
      index_using?: index_type;
      index_columns: column_order[];
      with?: index_option[];
      with_before_where: true;
      tablespace?: {type: 'origin'; value: string; }
      where?: where_clause;
    }

export type create_index_stmt = AstStatement<create_index_stmt_node>;

export type column_order_list = column_order[];



export type column_order = {
      column: expr;
      collate: collate_expr;
      opclass: ident;
      order: 'asc' | 'desc';
      nulls: 'nulls last' | 'nulls first';
    };

export type create_like_table_simple = { type: 'like'; table: table_ref_list; };

export type create_like_table = create_like_table_simple | create_like_table_simple & { parentheses?: boolean; };

export type create_table_definition = create_definition[];

export type create_definition = create_column_definition | create_index_definition | create_fulltext_spatial_index_definition | create_constraint_definition;



export type create_column_definition = {
        column: column_ref;
        definition: data_type;
        nullable: column_constraint['nullable'];
        default_val: column_constraint['default_val'];
        auto_increment?: 'auto_increment';
        unique_or_primary?: 'unique' | 'primary key';
        comment?: keyword_comment;
        collate?: collate_expr;
        column_format?: column_format;
        storage?: storage;
        reference_definition?: reference_definition;
        resource: 'column';
      };

export type column_constraint = { nullable: literal_null | literal_not_null; default_val: default_expr; };

export type collate_expr = { type: 'collate'; value: ident; };

export type column_format = { type: 'column_format'; value: 'fixed' | 'dynamic' | 'default'; };

export type storage = { type: 'storage'; value: 'disk' | 'memory' };

export type default_expr = { type: 'default'; value: literal | expr; };

export type drop_index_opt = (ALTER_ALGORITHM | ALTER_LOCK)[];

export interface drop_stmt_node {
        type: 'drop';
        keyword: 'table';
        name: table_ref_list;
      }

export interface drop_index_stmt_node {
        type: 'drop';
        keyword: string;
        name: column_ref;
        table: table_name;
        options?: drop_index_opt;
      }

export type drop_stmt = AstStatement<drop_stmt_node> | AstStatement<drop_index_stmt_node>;

export interface truncate_stmt_node {
        type: 'trucate';
        keyword: 'table';
        name: table_ref_list;
      }

export type truncate_stmt = AstStatement<truncate_stmt_node>;

export interface use_stmt_node {
        type: 'use';
        db: ident;
      }

export type use_stmt = AstStatement<use_stmt_node>;

export interface alter_table_stmt_node {
        type: 'alter';
        table: table_ref_list;
        expr: alter_action_list;
      }

export type alter_table_stmt = AstStatement<alter_table_stmt_node>;

export type alter_action_list = alter_action[];

export type alter_action = ALTER_ADD_COLUMN | ALTER_DROP_COLUMN | ALTER_ADD_INDEX_OR_KEY | ALTER_ADD_FULLETXT_SPARITAL_INDEX | ALTER_RENAME_TABLE | ALTER_ALGORITHM | ALTER_LOCK;



export type ALTER_ADD_COLUMN = {
        action: 'add';
        keyword: KW_COLUMN;
        resource: 'column';
        type: 'alter';
      } & create_column_definition;;



export type ALTER_DROP_COLUMN = {
        action: 'drop';
        collumn: column_ref;
        keyword: KW_COLUMN;
        resource: 'column';
        type: 'alter';
      };



export type ALTER_ADD_INDEX_OR_KEY = {
         action: 'add';
         type: 'alter';
         } & create_index_definition;



export type ALTER_RENAME_TABLE = {
         action: 'rename';
         type: 'alter';
         resource: 'table';
         keyword?: 'to' | 'as';
         table: ident;
         };



export type ALTER_ALGORITHM = {
        type: 'alter';
        keyword: 'algorithm';
        resource: 'algorithm';
        symbol?: '=';
        algorithm: 'DEFAULT' | 'INSTANT' | 'INPLACE' | 'COPY';
      };



export type ALTER_LOCK = {
      type: 'alter';
      keyword: 'lock';
      resource: 'lock';
      symbol?: '=';
      lock: 'DEFAULT' | 'NONE' | 'SHARED' | 'EXCLUSIVE';
    };



export type create_index_definition = {
         index: column;
         definition: cte_column_definition;
         keyword: 'index' | 'key';
         index_type?: index_type;
         resource: 'index';
         index_options?: index_options;
       };



export type create_fulltext_spatial_index_definition = {
          index: column;
          definition: cte_column_definition;
          keyword: 'fulltext' | 'spatial' | 'fulltext key' | 'spatial key' | 'fulltext index' | 'spatial index';
          index_options?: index_options;
          resource: 'index';
        };

export type create_constraint_definition = create_constraint_primary | create_constraint_unique | create_constraint_foreign;

export type constraint_name = { keyword: 'constraint'; constraint: ident; };



export type create_constraint_primary = {
      constraint?: constraint_name['constraint'];
      definition: cte_column_definition;
      constraint_type: 'primary key';
      index_type?: index_type;
      resource: 'constraint';
      index_options?: index_options;
    };



export type create_constraint_unique = {
      constraint?: constraint_name['constraint'];
      definition: cte_column_definition;
      constraint_type: 'unique key' | 'unique' | 'unique index';
      index_type?: index_type;
      resource: 'constraint';
      index_options?: index_options;
    };



export type create_constraint_foreign = {
      constraint?: constraint_name['constraint'];
      definition: cte_column_definition;
      constraint_type: 'FOREIGN KEY';
      keyword: constraint_name['keyword'];
      index?: column;
      resource: 'constraint';
      reference_definition?: reference_definition;
    };



export type reference_definition = {
        definition: cte_column_definition;
        table: table_ref_list;
        keyword: 'references';
        match: 'match full' | 'match partial' | 'match simple';
        on_delete?: on_reference;
        on_update?: on_reference;
      };

export type on_reference = { type: 'on delete' | 'on update'; value: reference_option; };

export type reference_option = 'restrict' | 'cascade' | 'set null' | 'no action' | 'set default';



export type create_constraint_trigger = {
      type: 'create';
      constraint: string;
      location: 'before' | 'after' | 'instead of';
      events: trigger_event_list;
      table: table_name;
      from?: table_name;
      deferrable?: trigger_deferrable;
      for_each?: trigger_for_row;
      when?: trigger_when;
      execute: {
        keyword: 'execute procedure';
        expr: proc_func_call;
      };
      constraint_type: 'trigger';
      keyword: 'trigger';
      constraint_kw: 'constraint';
      resource: 'constraint';
    };

export type trigger_event = { keyword: 'insert' | 'delete' | 'truncate' } | { keyword: 'update'; args?: { keyword: 'of', columns: column_ref_list; }};

export type trigger_event_list = trigger_event[];;

export type trigger_deferrable = { keyword: 'deferrable' | 'not deferrable'; args: 'initially immediate' | 'initially deferred' };

export type trigger_for_row = { keyword: 'for' | 'for each'; args: 'row' | 'statement' };

export type trigger_when = { type: 'when'; cond: expr; parentheses: true; };

export type table_options = table_option[];

export type create_option_character_set_kw = string;



export type create_option_character_set = {
      keyword: 'character set' | 'charset' | 'collate' | 'default character set' | 'default charset' | 'default collate';
      symbol: '=';
      value: ident_name;
      };



export type table_option = {
      keyword: 'auto_increment' | 'avg_row_length' | 'key_block_size' | 'max_rows' | 'min_rows' | 'stats_sample_pages';
      symbol: '=';
      value: number; // <== literal_numeric['value']
      } | create_option_character_set | { keyword: 'connection' | 'comment'; symbol: '='; value: string; } | { keyword: 'compression'; symbol: '='; value: "'ZLIB'" | "'LZ4'" | "'NONE'" } | { keyword: 'engine'; symbol: '='; value: string; };

export type ALTER_ADD_FULLETXT_SPARITAL_INDEX = create_fulltext_spatial_index_definition & { action: 'add'; type: 'alter' };

export interface rename_stmt_node {
        type: 'rename';
        table: table_to_list;
      }

export type rename_stmt = AstStatement<rename_stmt_node>;

export interface set_stmt_node {
        type: 'set';
        expr: assign_stmt & { keyword?: 'GLOBAL' | 'SESSION' | 'LOCAL' | 'PERSIST' | 'PERSIST_ONLY'; };
      }

export type set_stmt = AstStatement<set_stmt_node>;

export type lock_mode = { mode: string; };

export interface lock_stmt_node {
        type: 'lock';
        keyword: 'lock';
        tables: [[table_base], ...{table: table_ref}[]]; // see table_ref_list
        lock_mode?: lock_mode;
        nowait?: 'NOWAIT';
      }

export type lock_stmt = AstStatement<lock_stmt_node>;

export interface call_stmt_node {
      type: 'call';
      expr: proc_func_call;
    }

export type call_stmt = AstStatement<call_stmt_node>;

export interface select_stmt_node extends select_stmt_nake  {
       parentheses_symbol: true;
      }

export type select_stmt = select_stmt_nake | select_stmt_node;

export type with_clause = cte_definition[] | [cte_definition & {recursive: true; }];

export type cte_definition = { name: ident_name; stmt: union_stmt; columns?: cte_column_definition; };

export type cte_column_definition = column[];



export type select_stmt_nake = {
          with?: with_clause;
          type: 'select';
          options?: option_clause;
          distinct?: 'DISTINCT';
          columns: column_clause;
          from?: from_clause;
          where?: where_clause;
          groupby?: group_by_clause;
          having?: having_clause;
          orderby?: order_by_clause;
          limit?: limit_clause;
        };

export type option_clause = query_option[];

export type query_option = 'SQL_CALC_FOUND_ROWS'| 'SQL_CACHE'| 'SQL_NO_CACHE'| 'SQL_BIG_RESULT'| 'SQL_SMALL_RESULT'| 'SQL_BUFFER_RESULT';

export type column_clause = 'ALL' | '*' | column_list_item[] | column_list_item[];

export type column_list_item = { type: 'cast'; expr: expr; symbol: '::'; target: data_type;  as?: null; } | { type: 'star_ref'; expr: column_ref; as: null; } | { type: 'expr'; expr: expr; as?: alias_clause; };





export type alias_clause = alias_ident | ident;



export type from_clause = table_ref_list;

export type table_to_list = table_to_item[];

export type table_to_item = table_name[];

export type index_type = { keyword: 'using'; type: 'btree' | 'hash' | 'gist' | 'gin' };

export type index_options_list = index_option[];

export type index_options = index_option[];

export type index_option = { type: 'key_block_size'; symbol: '='; expr: number; } | { type: ident_name; symbol: '='; expr: number | {type: 'origin'; value: ident; }; } | index_type | { type: 'with parser'; expr: ident_name } | { type: 'visible'; expr: 'visible' } | { type: 'invisible'; expr: 'invisible' } | keyword_comment;

export type table_ref_list = [table_base, ...table_ref[]];





export type table_ref = table_base | table_join;



export type table_join = table_base & {join: join_op; using: ident_name[]; } | table_base & {join: join_op; on?: on_clause; } | {
      expr: union_stmt & { parentheses: true; };
      as?: alias_clause;
      join: join_op;
      on?: on_clause;
    };

export type table_base = { type: 'dual' } | table_name & { as?: alias_clause; } | { expr: union_stmt; as?: alias_clause; };









export type join_op = 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL JOIN' | 'INNER JOIN';

export type table_name = { db?: ident; table: ident | '*'; };



export type on_clause = expr;



export type where_clause = expr;



export type group_by_clause = expr_list['value'];

export type column_ref_list = column_ref[];



export type having_clause = expr;

export type as_window_specification = { window_specification: window_specification; parentheses: boolean };

export type window_specification = { name: null; partitionby: partition_by_clause; orderby: order_by_clause; window_frame_clause: string };

export type window_specification_frameless = { name: null; partitionby: partition_by_clause; orderby: order_by_clause; window_frame_clause: null };

export type window_frame_clause = string;

export type window_frame_following = string | window_frame_current_row;

export type window_frame_preceding = string | window_frame_current_row;

export type window_frame_current_row = { type: 'single_quote_string'; value: string };

export type window_frame_value = literal_string | literal_numeric;



export type partition_by_clause = column_clause;



export type order_by_clause = order_by_list;

export type order_by_list = order_by_element[];

export type order_by_element = { expr: expr; type: 'ASC' | 'DESC'; };

export type number_or_param = literal_numeric | param;

export type limit_clause = { separator: 'offset' | ''; value: [number_or_param | { type: 'origin', value: 'all' }, number_or_param?] };

export interface update_stmt_node {
         type: 'update';
         table: table_ref_list;
         set: set_list;
         where?: where_clause;
         returning?: returning_stmt;
      }

export type update_stmt = AstStatement<update_stmt_node>;

export interface table_ref_addition extends table_name {
        addition: true;
        as?: alias_clause;
      }
       export interface delete_stmt_node {
         type: 'delete';
         table?: table_ref_list | [table_ref_addition];
         where?: where_clause;
      }

export type delete_stmt = AstStatement<delete_stmt_node>;

export type set_list = set_item[];

export type set_item = { column: ident; value: additive_expr; table?: ident;} | { column: ident; value: column_ref; table?: ident; keyword: 'values' };

export type returning_stmt = { type: 'returning'; columns: column_ref_list | column_ref; };

export type insert_value_clause = value_clause | select_stmt_nake;

export type insert_partition = ident_name[] | value_item;

export interface replace_insert_stmt_node {
         type: 'insert' | 'replace';
         table?: [table_name];
         columns: column_list;
         values: insert_value_clause;
         partition?: insert_partition;
         returning?: returning_stmt;
      }

export type replace_insert_stmt = AstStatement<replace_insert_stmt_node>;

export type insert_no_columns_stmt = AstStatement<replace_insert_stmt_node>;





export type replace_insert = 'insert' | 'replace';



export type value_clause = value_list;

export type value_list = value_item[];

export type value_item = expr_list;

export type expr_list = { type: 'expr_list'; value: expr[] };

export type interval_expr = { type: 'interval', expr: expr; unit: interval_unit; };



export type case_expr = {
          type: 'case';
          expr?: expr;
          // nb: Only the last element is a case_else
          args: (case_when_then | case_else)[];
        };

export type case_when_then = { type: 'when'; cond: expr; result: expr; };

export type case_else = { type: 'else'; condition?: never; result: expr; };

export type expr = logic_operator_expr | unary_expr | or_expr | select_stmt;

export type BINARY_OPERATORS = LOGIC_OPERATOR | 'OR' | 'AND' | multiplicative_operator | additive_operator
      | arithmetic_comparison_operator
      | 'IN' | 'NOT IN'
      | 'BETWEEN' | 'NOT BETWEEN'
      | 'IS' | 'IS NOT'
      | 'LIKE'
      | '@>' | '<@' | OPERATOR_CONCATENATION | DOUBLE_WELL_ARROW | WELL_ARROW | '?' | '?|' | '?&' | '#-'
    export interface binary_expr {
      type: 'binary_expr',
      operator: BINARY_OPERATORS,
      left: expr,
      right: expr
    }

export type logic_operator_expr = binary_expr;

export type UNARY_OPERATORS = '+' | '-' | 'EXISTS' | 'NOT EXISTS'  | 'NULL'

export type unary_expr = {
      type: 'unary_expr',
      operator: UNARY_OPERATORS,
      expr: expr;
      parentheses?: boolean;
    };

export type or_and_where_expr = binary_expr;

export type parentheses_or_expr = binary_expr;

export type or_expr = binary_expr;

export type and_expr = binary_expr;

export type not_expr = comparison_expr | exists_expr | unary_expr;

export type comparison_expr = binary_expr | literal_string | column_ref;

export type exists_expr = unary_expr;



export type exists_op = 'NOT EXISTS' | KW_EXISTS;

export type comparison_op_right = arithmetic_op_right | in_op_right | between_op_right | is_op_right | like_op_right | jsonb_op_right;

export type arithmetic_op_right = { type: 'arithmetic'; tail: any };

export type arithmetic_comparison_operator = ">=" | ">" | "<=" | "<>" | "<" | "=" | "!=";

export type is_op_right = { op: 'IS'; right: additive_expr; } | { type: 'origin'; value: string; } | { type: 'IS NOT'; right: additive_expr; };

export type between_op_right = { op: 'BETWEEN' | 'NOT BETWEEN'; right: { type: 'expr_list'; value: [expr, expr] }  };



export type between_or_not_between_op = 'NOT BETWEEN' | KW_BETWEEN;



export type like_op = 'LIKE' | KW_LIKE | KW_ILIKE;



export type in_op = 'NOT IN' | KW_IN;

export type like_op_right = { op: like_op; right: literal | comparison_expr};

export type in_op_right = {op: in_op; right: expr_list | var_decl | literal_string; };

export type jsonb_op_right = { op: string; right: expr };

export type additive_expr = binary_expr;

export type additive_operator = "+" | "-";

export type multiplicative_expr = binary_expr;

export type multiplicative_operator = "*" | "/" | "%";

export type primary = cast_expr | literal | aggr_func | window_func | func_call | case_expr | interval_expr | column_ref | param | expr | binary_expr | expr_list | var_decl | { type: 'origin'; value: string; };



export type column_ref = {
        type: 'column_ref';
        table: ident;
        column: column | '*';
        arrow?: '->>' | '->';
        property?: literal_string | literal_numeric;
      };

export type column_list = column[];

export type ident = string;

export type alias_ident = string;

export type quoted_ident = double_quoted_ident | single_quoted_ident | backticks_quoted_ident;



export type double_quoted_ident = string;



export type single_quoted_ident = string;



export type backticks_quoted_ident = string;



export type column = string | quoted_ident;



export type column_name = string;

export type ident_name = string;

type ident_start = never;

type ident_part = never;

type column_part = never;

export type param = { type: 'param'; value: ident_name };

export type over_partition = { type: 'windows'; as_window_specification: as_window_specification } | { partitionby: partition_by_clause; orderby: order_by_clause };

export type aggr_func = aggr_fun_count | aggr_fun_smma | aggr_array_agg;

export type window_func = window_fun_rank | window_fun_laglead | window_fun_firstlast;

export type window_fun_rank = { type: 'window_func'; name: string; over: over_partition };

export type window_fun_laglead = { type: 'window_func'; name: string; args: expr_list; consider_nulls: string; over: over_partition };

export type window_fun_firstlast = window_fun_laglead;

type KW_FIRST_LAST_VALUE = never;

type KW_WIN_FNS_RANK = never;

type KW_LAG_LEAD = never;

export type consider_nulls_clause = string;

export type aggr_fun_smma = { type: 'aggr_func'; name: 'SUM' | 'MAX' | 'MIN' | 'AVG'; args: { expr: additive_expr }; over: over_partition };

type KW_SUM_MAX_MIN_AVG = never;

export type aggr_fun_count = { type: 'aggr_func'; name: 'COUNT'; args:count_arg; over: over_partition };





export type distinct_args = { distinct: 'DISTINCT'; expr: column_ref; };



export type count_arg = { expr: star_expr } | distinct_args;

export type aggr_array_agg = { type: 'aggr_func'; args:count_arg; name: 'ARRAY_AGG'; orderby?: order_by_clause  };



export type star_expr = { type: 'star'; value: '*' };

export type func_call = { type: 'function'; name: string; args: expr_list; } | { type: 'function'; name: string; args: expr_list; over?: over_partition; } | extract_func;

export type extract_filed = "CENTURY" | "DAY" | "DECADE" | "DOW" | "DOY" | "EPOCH" | "HOUR" | "ISODOW" | "ISOYEAR" | "MICROSECONDS" | "MILLENNIUM" | "MILLISECONDS" | "MINUTE" | "MONTH" | "QUARTER" | "SECOND" | "TIMEZONE" | "TIMEZONE_HOUR" | "TIMEZONE_MINUTE" | "WEEK" | 'string';

export type extract_func = { type: 'extract'; args: { field: extract_filed; cast_type: 'TIMESTAMP' | 'INTERVAL' | 'TIME'; source: expr; }};

export type scalar_func = KW_CURRENT_DATE | KW_CURRENT_TIME | KW_CURRENT_TIMESTAMP | KW_CURRENT_USER | KW_USER | KW_SESSION_USER | KW_SYSTEM_USER;



export type cast_expr = {
        as?: alias_clause,
        type: 'cast';
        expr: expr | literal | aggr_func | func_call | case_expr | interval_expr | column_ref | param
          | expr;
        symbol: '::' | 'as',
        target: data_type;
      };

export type signedness = KW_SIGNED | KW_UNSIGNED;

export type literal = literal_string | literal_numeric | literal_bool | literal_null | literal_datetime | literal_array;



export type literal_array = {
        expr_list: expr_list | {type: 'origin', value: ident },
        type: string,
        keyword: string,
        brackets: boolean
      };

export type literal_list = literal[];

export type literal_null = { type: 'null'; value: null };

export type literal_not_null = { type: 'not null'; value: 'not null' };

export type literal_bool = { type: 'bool', value: true } | { type: 'bool', value: false };

export type literal_string = { type: 'single_quote_string'; value: string; } | { type: 'string'; value: string; };

export type literal_datetime = { type: 'TIME' | 'DATE' | 'TIMESTAMP' | 'DATETIME', value: string } | { type: 'origin'; value: string; };

export type single_quote_char = string;

export type single_char = string;

export type escape_char = string;

export type line_terminator = string;

export type literal_numeric = number | { type: 'bigint'; value: string; };

export type int = string;

export type frac = string;

export type exp = string;

export type digits = string;

export type digit = string;

export type hexDigit = string;

export type e = string;

type KW_NULL = never;

type KW_DEFAULT = never;

type KW_NOT_NULL = never;

type KW_TRUE = never;

type KW_TO = never;

type KW_FALSE = never;

type KW_SHOW = never;

type KW_DROP = never;

type KW_USE = never;

type KW_ALTER = never;

type KW_SELECT = never;

type KW_UPDATE = never;

type KW_CREATE = never;

type KW_TEMPORARY = never;

type KW_TEMP = never;

type KW_IF_NOT_EXISTS = never;

type KW_DELETE = never;

type KW_INSERT = never;

type KW_RECURSIVE = never;

type KW_REPLACE = never;

type KW_RETURNING = never;

type KW_RENAME = never;

type KW_IGNORE = never;

type KW_EXPLAIN = never;

type KW_PARTITION = never;

type KW_INTO = never;

type KW_FROM = never;

type KW_SET = never;

type KW_LOCK = never;

type KW_AS = never;

type KW_TABLE = never;

type KW_DATABASE = never;

type KW_SCHEME = never;

type KW_SEQUENCE = never;

type KW_TABLESPACE = never;

type KW_COLLATE = never;

type KW_ON = never;

type KW_LEFT = never;

type KW_RIGHT = never;

type KW_FULL = never;

type KW_INNER = never;

type KW_JOIN = never;

type KW_OUTER = never;

type KW_UNION = never;

type KW_VALUES = never;

type KW_USING = never;

type KW_WHERE = never;

type KW_WITH = never;

type KW_GROUP = never;

type KW_BY = never;

type KW_ORDER = never;

type KW_HAVING = never;

type KW_LIMIT = never;

type KW_OFFSET = never;

type KW_ASC = never;

type KW_DESC = never;

type KW_ALL = never;

type KW_DISTINCT = never;

type KW_BETWEEN = never;

type KW_IN = never;

type KW_IS = never;

type KW_LIKE = never;

type KW_ILIKE = never;

type KW_EXISTS = never;

type KW_NOT = never;

type KW_AND = never;

type KW_OR = never;

type KW_ARRAY = never;

type KW_ARRAY_AGG = never;

type KW_COUNT = never;

type KW_MAX = never;

type KW_MIN = never;

type KW_SUM = never;

type KW_AVG = never;

type KW_EXTRACT = never;

type KW_CALL = never;

type KW_CASE = never;

type KW_WHEN = never;

type KW_THEN = never;

type KW_ELSE = never;

type KW_END = never;

type KW_CAST = never;

type KW_BOOL = never;

type KW_BOOLEAN = never;

type KW_CHAR = never;

type KW_VARCHAR = never;

type KW_NUMERIC = never;

type KW_DECIMAL = never;

type KW_SIGNED = never;

type KW_UNSIGNED = never;

type KW_INT = never;

type KW_ZEROFILL = never;

type KW_INTEGER = never;

type KW_JSON = never;

type KW_JSONB = never;

type KW_GEOMETRY = never;

type KW_SMALLINT = never;

type KW_TINYINT = never;

type KW_TINYTEXT = never;

type KW_TEXT = never;

type KW_MEDIUMTEXT = never;

type KW_LONGTEXT = never;

type KW_BIGINT = never;

type KW_FLOAT = never;

type KW_DOUBLE = never;

type KW_DATE = never;

type KW_DATETIME = never;

type KW_ROWS = never;

type KW_TIME = never;

type KW_TIMESTAMP = never;

type KW_TRUNCATE = never;

type KW_USER = never;

type KW_UUID = never;

type KW_CURRENT_DATE = never;

type KW_ADD_DATE = never;

type KW_INTERVAL = never;

type KW_UNIT_YEAR = never;

type KW_UNIT_MONTH = never;

type KW_UNIT_DAY = never;

type KW_UNIT_HOUR = never;

type KW_UNIT_MINUTE = never;

type KW_UNIT_SECOND = never;

type KW_CURRENT_TIME = never;

type KW_CURRENT_TIMESTAMP = never;

type KW_CURRENT_USER = never;

type KW_SESSION_USER = never;

type KW_SYSTEM_USER = never;

type KW_GLOBAL = never;

type KW_SESSION = never;

type KW_LOCAL = never;

type KW_PERSIST = never;

type KW_PERSIST_ONLY = never;

type KW_VAR__PRE_AT = never;

type KW_VAR__PRE_AT_AT = never;

type KW_VAR_PRE_DOLLAR = never;

type KW_VAR_PRE = never;

type KW_RETURN = never;

type KW_ASSIGN = never;

type KW_DOUBLE_COLON = never;

type KW_ASSIGIN_EQUAL = never;

type KW_DUAL = never;

type KW_ADD = never;

type KW_COLUMN = never;

type KW_INDEX = never;

type KW_KEY = never;

type KW_FULLTEXT = never;

type KW_SPATIAL = never;

type KW_UNIQUE = never;

type KW_KEY_BLOCK_SIZE = never;

type KW_COMMENT = never;

type KW_CONSTRAINT = never;

type KW_CONCURRENTLY = never;

type KW_REFERENCES = never;

export type OPT_SQL_CALC_FOUND_ROWS = "SQL_CALC_FOUND_ROWS";

export type OPT_SQL_CACHE = "SQL_CACHE";

export type OPT_SQL_NO_CACHE = "SQL_NO_CACHE";

export type OPT_SQL_SMALL_RESULT = "SQL_SMALL_RESULT";

export type OPT_SQL_BIG_RESULT = "SQL_BIG_RESULT";

export type OPT_SQL_BUFFER_RESULT = "SQL_BUFFER_RESULT";

export type DOT = ".";

export type COMMA = ",";

export type STAR = "*";

export type LPAREN = "(";

export type RPAREN = ")";

export type LBRAKE = "[";

export type RBRAKE = "]";

export type SEMICOLON = ";";

export type SINGLE_ARROW = "->";

export type DOUBLE_ARROW = "->>";

export type WELL_ARROW = "#>";

export type DOUBLE_WELL_ARROW = "#>>";

export type OPERATOR_CONCATENATION = "||";

export type OPERATOR_AND = "&&";

export type LOGIC_OPERATOR = OPERATOR_CONCATENATION | OPERATOR_AND;

export type __ = (whitespace | comment)[];

export type ___ = (whitespace | comment)[];

export type comment = block_comment | line_comment;

type block_comment = never;

type line_comment = never;

type pound_sign_comment = never;

export type keyword_comment = { type: 'comment'; keyword: 'comment'; symbol: '='; value: literal_string; };

type char = never;

export type interval_unit = KW_UNIT_YEAR | KW_UNIT_MONTH | KW_UNIT_DAY | KW_UNIT_HOUR | KW_UNIT_MINUTE | KW_UNIT_SECOND;

type whitespace = never;

type EOL = never;

type EOF = never;

export type proc_stmts = (proc_stmt)[];

export type proc_stmt = { type: 'proc'; stmt: assign_stmt | return_stmt; vars: any };

export type assign_stmt = { type: 'assign'; left: var_decl | without_prefix_var_decl; symbol: ':=' | '='; right: proc_expr; };

export type return_stmt = { type: 'return'; expr: proc_expr; };

export type proc_expr = select_stmt | proc_join | proc_additive_expr | proc_array;

export type proc_additive_expr = binary_expr;

export type proc_multiplicative_expr = binary_expr;

export type proc_join = { type: 'join'; ltable: var_decl; rtable: var_decl; op: join_op; expr: on_clause; };

export type proc_primary = literal | var_decl | proc_func_call | param | proc_additive_expr & { parentheses: true; };

export type proc_func_name = string;

export type proc_func_call = { type: 'function'; name: string; args: null | { type: expr_list; value: proc_primary_list; }};

export type proc_primary_list = proc_primary[];

export type proc_array = { type: 'array'; value: proc_primary_list };

export type var_decl = without_prefix_var_decl & { type: 'var'; prefix: string; };;

export type without_prefix_var_decl = { type: 'var'; prefix: string; name: ident_name; members: mem_chain; };

export type mem_chain = ident_name[];;

export type data_type = {
                    dataType: string;
                    length?: number;
                    suffix?: string;
                    scale?: number;
                    parentheses?: boolean;
                };



export type boolean_type = data_type;





export type character_string_type = data_type;

export type numeric_type_suffix = any[];;







export type numeric_type = data_type;





export type datetime_type = data_type;



export type json_type = data_type;



export type geometry_type = data_type;





export type text_type = data_type;



export type uuid_type = data_type;