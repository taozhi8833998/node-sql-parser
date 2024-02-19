
/*
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔ THIS FILE HAS BEEN AUTO-GENERATED DO NOT EDIT IT ! ⛔⛔⛔⛔⛔⛔⛔⛔
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔
*/

export type start = multiple_stmt | create_function_stmt;

export type cmd_stmt = drop_stmt | create_stmt | declare_stmt | truncate_stmt | rename_stmt | call_stmt | use_stmt | alter_stmt | set_stmt | lock_stmt | show_stmt | deallocate_stmt | grant_revoke_stmt | if_else_stmt | raise_stmt | execute_stmt | for_loop_stmt | transaction_stmt;

export type create_stmt = create_table_stmt | create_constraint_trigger | create_extension_stmt | create_index_stmt | create_sequence | create_db_stmt | create_domain_stmt | create_type_stmt | create_view_stmt | create_aggregate_stmt;

export type alter_stmt = alter_table_stmt | alter_schema_stmt | alter_domain_type_stmt | alter_function_stmt | alter_aggregate_stmt;

export type crud_stmt = union_stmt | update_stmt | replace_insert_stmt | insert_no_columns_stmt | delete_stmt | cmd_stmt | proc_stmts;

// is in reality: { tableList: any[]; columnList: any[]; ast: T; }
      export type AstStatement<T> = T;

export type multiple_stmt = AstStatement<curd_stmt | crud_stmt[]>;

export type set_op = 'union' | 'union all' | 'union distinct' | 'intersect | 'except';

export interface union_stmt_node extends select_stmt_node  {
         _next: union_stmt_node;
         set_op: 'union' | 'union all' | 'union distinct';
      }

export type union_stmt = AstStatement<union_stmt_node>;

export type if_not_exists_stmt = 'IF NOT EXISTS';

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
        keyword: 'database' | 'schema',
        if_not_exists?: 'if not exists',
        database: string,
        create_definitions?: create_db_definition
      }

export type create_db_stmt = AstStatement<create_db_stmt>;

export type view_with = string;

export type with_view_option = {type: string; value: string; symbol: string; };

export type with_view_options = with_view_option[];

export type create_view_stmt = {
        type: 'create',
        keyword: 'view',
        replace?: 'or replace',
        temporary?: 'temporary' | 'temp',
        recursive?: 'recursive',
        view: table_name,
        columns?: column_list,
        select: select_stmt_nake,
        with_options?: with_options,
        with?: string,
      }

export type create_view_stmt = AstStatement<create_view_stmt>;

export type create_aggregate_opt_required = { type: string; symbol: '='; value: expr; }[];

export type create_aggregate_opt_optional = { type: string; symbol: '='; value: ident | expr; };

export type create_aggregate_opts = create_aggregate_opt_optional[];

export type create_aggregate_stmt = {
        type: 'create',
        keyword: 'aggregate',
        replace?: 'or replace',
        name: table_name,
        args?: aggregate_signature,
        options: create_aggregate_opt_optional[]
      }

export type create_aggregate_stmt = AstStatement<create_aggregate_stmt>;

export type column_data_type = { column: column_ref; definition: data_type; };

export type column_data_type_list = column_data_type[];

export type func_returns = { type: "returns"; keyword?: "setof"; expr: data_type; } | { type: "returns"; keyword?: "table"; expr: column_data_type_list; };

export type declare_variable_item = { keyword: 'variable'; name: string, constant?: string; datatype: data_type; collate?: collate; not_null?: string; default?: { type: 'default'; keyword: string; value: literal | expr; }; };

export type declare_variables = declare_variable_item[];

export type declare_stmt = { type: 'declare'; declare: declare_variable_item[]; }

export type declare_stmt = AstStatement<declare_stmt>;

export type create_func_opt = literal_string | { type: 'as'; begin?: string; declare?: declare_stmt; expr: multiple_stmt; end?: string; symbol: string; } | literal_numeric | { type: "set"; parameter: ident_name; value?: { prefix: string; expr: expr }};

export type create_function_stmt = {
        type: 'create';
        replace?: string;
        name: { schema?: string; name: string };
        args?: alter_func_args;
        returns?: func_returns;
        keyword: 'function';
        options?: create_func_opt[];
      }

export type create_function_stmt = AstStatement<create_function_stmt>;

export type create_type_stmt = {
        type: 'create',
        keyword: 'type',
        name: { schema: string; name: string },
        as?: string,
        resource?: string,
        create_definitions?: any
      }

export type create_type_stmt = AstStatement<create_type_stmt>;

export type create_domain_stmt = {
        type: 'create',
        keyword: 'domain',
        domain: { schema: string; name: string },
        as?: string,
        target: data_type,
        create_definitions?: any[]
      }

export type create_domain_stmt = AstStatement<create_domain_stmt>;

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
        create_definitions?: create_table_definition;
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
        create_definitions?: create_sequence_definition_list
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
      collate: collate_expr;
      opclass: ident;
      order: 'asc' | 'desc';
      nulls: 'nulls last' | 'nulls first';
    };

export type create_like_table_simple = { type: 'like'; table: table_ref_list; };

export type create_like_table = create_like_table_simple | create_like_table_simple & { parentheses?: boolean; };

export type create_table_definition = create_definition[];

export type create_definition = create_column_definition | create_index_definition | create_fulltext_spatial_index_definition | create_constraint_definition;

export type column_definition_opt = column_constraint | { auto_increment: 'auto_increment'; } | { unique: 'unique' | 'unique key'; } | { unique: 'key' | 'primary key'; } | { comment: keyword_comment; } | { collate: collate_expr; } | { column_format: column_format; } | { storage: storage } | { reference_definition: reference_definition; } | { character_set: collate_expr };



export type column_definition_opt_list = {
        nullable?: column_constraint['nullable'];
        default_val?: column_constraint['default_val'];
        auto_increment?: 'auto_increment';
        unique?: 'unique' | 'unique key';
        primary?: 'key' | 'primary key';
        comment?: keyword_comment;
        collate?: collate_expr;
        column_format?: column_format;
        storage?: storage;
        reference_definition?: reference_definition;
      };



export type create_column_definition = {
        column: column_ref;
        definition: data_type;
        nullable: column_constraint['nullable'];
        default_val: column_constraint['default_val'];
        auto_increment?: 'auto_increment';
        unique?: 'unique' | 'unique key';
        primary?: 'key' | 'primary key';
        comment?: keyword_comment;
        collate?: collate_expr;
        column_format?: column_format;
        storage?: storage;
        reference_definition?: reference_definition;
        resource: 'column';
      };

export type column_constraint = { nullable: literal_null | literal_not_null; default_val: default_expr; };

export type collate_expr = { type: 'collate'; symbol: '=' | null; value: ident; };

export type column_format = { type: 'column_format'; value: 'fixed' | 'dynamic' | 'default'; };

export type storage = { type: 'storage'; value: 'disk' | 'memory' };

export type default_arg_expr = { type: 'default'; keyword: string, value: literal | expr; };

export type default_expr = { type: 'default'; value: literal | expr; };

export type drop_index_opt = (ALTER_ALGORITHM | ALTER_LOCK)[];

export interface drop_stmt_node {
        type: 'drop';
        keyword: 'table';
        name: table_ref_list;
      }

export interface drop_index_stmt_node {
        type: 'drop';
        prefix?: 'CONCURRENTLY';
        keyword: string;
        name: column_ref;
        options?: 'cascade' | 'restrict';
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

export type aggregate_signature = { name: ”*“ } | alter_func_args;

export type alter_func_argmode = ignore;

export type alter_func_arg_item = { mode?: string; name?: string; type: data_type;  default: default_arg_expr; };

export type alter_func_args = alter_func_arg_item[];

export type alter_aggregate_stmt = AstStatement<alter_resource_stmt_node>;

export type alter_function_stmt = AstStatement<alter_resource_stmt_node>;

export interface alter_resource_stmt_node {
        type: 'alter';
        keyword: 'domain' | 'type',
        name: string | { schema: string, name: string };
        args?: { parentheses: true; expr?: alter_func_args; orderby?: alter_func_args; };
        expr: alter_rename_owner;
      }

export type alter_domain_type_stmt = AstStatement<alter_resource_stmt_node>;

export type alter_schema_stmt = AstStatement<alter_resource_stmt_node>;

export interface alter_table_stmt_node {
        type: 'alter';
        table: table_ref_list;
        expr: alter_action_list;
      }

export type alter_table_stmt = AstStatement<alter_table_stmt_node>;

export type alter_action_list = alter_action[];

export type alter_action = ALTER_ADD_COLUMN | ALTER_ADD_CONSTRAINT | ALTER_DROP_COLUMN | ALTER_ADD_INDEX_OR_KEY | ALTER_ADD_FULLETXT_SPARITAL_INDEX | ALTER_RENAME | ALTER_ALGORITHM | ALTER_LOCK;



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



export type ALTER_ADD_CONSTRAINT = {
        action: 'add';
        create_definitions: create_db_definition;
        resource: 'constraint';
        type: 'alter';
      };



export type ALTER_ADD_INDEX_OR_KEY = {
         action: 'add';
         type: 'alter';
         } & create_index_definition;

export interface alter_rename_owner {
        action: string;
        type: 'alter';
        resource: string;
        keyword?: 'to' | 'as';
        [key: string]: ident;
      }

export type ALTER_RENAME = AstStatement<alter_rename>;

export type ALTER_OWNER_TO = AstStatement<alter_rename_owner>;

export type ALTER_SET_SCHEMA = AstStatement<alter_rename_owner>;



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

export type create_constraint_definition = create_constraint_primary | create_constraint_unique | create_constraint_foreign | create_constraint_check;

export type constraint_name = { keyword: 'constraint'; constraint: ident; };



export type create_constraint_check = {
      constraint?: constraint_name['constraint'];
      definition: or_and_where_expr;
      keyword?: constraint_name['keyword'];
      constraint_type: 'check';
      resource: 'constraint';
    };



export type create_constraint_primary = {
      constraint?: constraint_name['constraint'];
      definition: cte_column_definition;
      constraint_type: 'primary key';
      keyword?: constraint_name['keyword'];
      index_type?: index_type;
      resource: 'constraint';
      index_options?: index_options;
    };



export type create_constraint_unique = {
      constraint?: constraint_name['constraint'];
      definition: cte_column_definition;
      constraint_type: 'unique key' | 'unique' | 'unique index';
      keyword?: constraint_name['keyword'];
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
        on_action: [on_reference?];
      } | {
      on_action: [on_reference];
    };

export type on_reference = { type: 'on delete' | 'on update'; value: reference_option; };

export type reference_option = { type: 'function'; name: string; args: expr_list; } | 'restrict' | 'cascade' | 'set null' | 'no action' | 'set default' | 'current_timestamp';



export type create_constraint_trigger = {
      type: 'create';
      replace?: string;
      constraint?: string;
      location: 'before' | 'after' | 'instead of';
      events: trigger_event_list;
      table: table_name;
      from?: table_name;
      deferrable?: trigger_deferrable;
      for_each?: trigger_for_row;
      when?: trigger_when;
      execute: {
        keyword: string;
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

export interface show_stmt_node {
          type: 'show';
          keyword: 'tables' | 'var';
          var?: without_prefix_var_decl;
        }

export type show_stmt = AstStatement<show_stmt_node>;

export interface deallocate_stmt_node {
          type: 'deallocate';
          keyword: 'PREPARE' | undefined;
          expr: { type: 'default', value: string }
        }

export type deallocate_stmt = AstStatement<deallocate_stmt_node>;

export interface origin_str_stmt {
        type: 'origin';
        value: string;
      }

export type priv_type_table = origin_str_stmt;

export type priv_type_sequence = origin_str_stmt;

export type priv_type_database = origin_str_stmt;

export type prive_type_all = origin_str_stmt;

export type prive_type_usage = origin_str_stmt | prive_type_all;

export type prive_type_execute = origin_str_stmt | prive_type_all;

export type priv_type = priv_type_table | priv_type_sequence | priv_type_database | prive_type_usage | prive_type_execute;

export type priv_item = { priv: priv_type; columns: column_ref_list; };

export type priv_list = priv_item[];

export type object_type = origin_str_stmt;

export type priv_level = { prefix: string; name: string; };

export type priv_level_list = priv_level[];

export type user_or_role = origin_str_stmt;

export type user_or_role_list = user_or_role[];

export type with_grant_option = origin_str_stmt;

export type with_admin_option = origin_str_stmt;

export type grant_revoke_keyword = { type: 'grant' } | { type: 'revoke'; grant_option_for?: origin_str_stmt; };

export interface grant_revoke_stmt {
        type: string;
        grant_option_for?: origin_str_stmt;
        keyword: 'priv';
        objects: priv_list;
        on: {
          object_type?: object_type;
          priv_level: priv_level_list;
        };
        to_from: 'to' | 'from';
        user_or_roles?: user_or_role_list;
        with?: with_grant_option;
      }

export type grant_revoke_stmt = AstStatement<grant_revoke_stmt> | => AstStatement<grant_revoke_stmt>;

export type elseif_stmt = { type: 'elseif'; boolean_expr: expr; then: curd_stmt; semicolon?: string; };

export type elseif_stmt_list = elseif_stmt[];

export interface if_else_stmt {
        type: 'if';
        keyword: 'if';
        boolean_expr: expr;
        semicolons: string[];
        if_expr: crud_stmt;
        elseif_expr: elseif_stmt[];
        else_expr: curd_stmt;
        prefix: literal_string;
        suffix: literal_string;
      }

export type if_else_stmt = AstStatement<if_else_stmt>;

export type raise_level = "DEBUG" | "LOG" | "INFO" | "NOTICE" | "WARNING" | "EXCEPTION";

export type raise_opt = { type: 'using'; option: string; symbol: '='; expr: expr[]; };

type raise_item = never;

export interface raise_stmt {
        type: 'raise';
        level?: string;
        raise?: raise_item;
        using?: raise_opt;
      }

export type raise_stmt = AstStatement<raise_stmt>;

export interface execute_stmt {
        type: 'execute';
        name: string;
        args?: { type: expr_list; value: proc_primary_list; }
      }

export type execute_stmt = AstStatement<execute_stmt>;

export type for_label = { label?: string; keyword: 'for'; };

export interface for_loop_stmt {
        type: 'for';
        label?: string
        target: string;
        query: select_stmt;
        stmts: multiple_stmt;
      }

export type for_loop_stmt = AstStatement<for_loop_stmt>;

export interface transaction_stmt {
        type: 'transaction';
        expr: {
          type: 'origin',
          value: string
        }
      }

export type transaction_stmt = AstStatement<transaction_stmt>;

export interface select_stmt_node extends select_stmt_nake  {
       parentheses: true;
      }

export type select_stmt = { type: 'select'; } | select_stmt_nake | select_stmt_node;

export type with_clause = cte_definition[] | [cte_definition & { recursive: true; }];

export type cte_definition = { name: { type: 'default'; value: string; }; stmt: crud_stmt; columns?: cte_column_definition; };

export type cte_column_definition = column_ref_list;

export type distinct_on = {type: string; columns: column_ref_list;} | { type: string | undefined; };



export type select_stmt_nake = {
          with?: with_clause;
          type: 'select';
          options?: option_clause;
          distinct?: {type: string; columns?: column_list; };
          columns: column_clause;
          from?: from_clause;
          into?: into_clause;
          where?: where_clause;
          groupby?: group_by_clause;
          having?: having_clause;
          orderby?: order_by_clause;
          limit?: limit_clause;
          window?: window_clause;
        };

export type option_clause = query_option[];

export type query_option = 'SQL_CALC_FOUND_ROWS'| 'SQL_CACHE'| 'SQL_NO_CACHE'| 'SQL_BIG_RESULT'| 'SQL_SMALL_RESULT'| 'SQL_BUFFER_RESULT';

export type column_clause = 'ALL' | '*' | column_list_item[] | column_list_item[];

export type array_index = { brackets: boolean, number: number };

export type expr_item = binary_expr & { array_index: array_index };

export type cast_data_type = data_type & { quoted?: string };

export type column_list_item = { expr: expr; as: null; } | { type: 'cast'; expr: expr; symbol: '::'; target: cast_data_type;  as?: null; arrows?: ('->>' | '->')[]; property?: (literal_string | literal_numeric)[]; } | { expr: column_ref; as: null; } | { type: 'expr'; expr: expr; as?: alias_clause; };



export type value_alias_clause = alias_ident;





export type alias_clause = alias_ident;

export type into_clause = { keyword: 'var'; type: 'into'; expr: var_decl_list; } | { keyword: 'var'; type: 'into'; expr: literal_string | ident; };



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
      expr: (union_stmt || table_ref_list) & { parentheses: true; };
      as?: alias_clause;
      join: join_op;
      on?: on_clause;
    };

export type table_base = { type: 'dual' } | { expr: value_clause; as?: alias_clause; } | { prefix?: string; expr: union_stmt | value_clause; as?: alias_clause; } | { prefix?: string; expr: table_ref_list; as?: alias_clause; } | { prefix?: string; type: 'expr'; expr: expr; as?: alias_clause; } | table_name & { expr: expr, repeatable: literal_numeric; as?: alias_clause;} | table_name & { as?: alias_clause; };











export type join_op = 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL JOIN' | 'CROSS JOIN' | 'INNER JOIN';

export type table_name = { db?: ident; schema?: ident, table: ident | '*'; };

export type or_and_expr = binary_expr;



export type on_clause = or_and_where_expr;



export type where_clause = or_and_where_expr;



export type group_by_clause = expr_list['value'];

export type column_ref_list = column_ref[];



export type having_clause = expr;

export type window_clause = { keyword: 'window'; type: 'window', expr: named_window_expr_list; };

export type named_window_expr_list = named_window_expr[];

export type named_window_expr = { name: ident_name;  as_window_specification: as_window_specification; };

export type as_window_specification = ident_name | { window_specification: window_specification; parentheses: boolean };

export type window_specification = { name: null; partitionby: partition_by_clause; orderby: order_by_clause; window_frame_clause: string | null; };

export type window_specification_frameless = { name: null; partitionby: partition_by_clause; orderby: order_by_clause; window_frame_clause: null };

export type window_frame_clause = string;

export type window_frame_following = string | window_frame_current_row;

export type window_frame_preceding = string | window_frame_current_row;

export type window_frame_current_row = { type: 'single_quote_string'; value: string };

export type window_frame_value = literal_string | literal_numeric;



export type partition_by_clause = column_clause;



export type order_by_clause = order_by_list;

export type order_by_list = order_by_element[];

export type order_by_element = { expr: expr; type: 'ASC' | 'DESC' | undefined;  nulls: 'NULLS FIRST' | 'NULLS LAST' | undefined };

export type number_or_param = literal_numeric | var_decl | param;

export type limit_clause = { separator: 'offset' | ''; value: [number_or_param | { type: 'origin', value: 'all' }, number_or_param?] };

export interface update_stmt_node {
        with?: with_clause;
         type: 'update';
         table: table_ref_list;
         set: set_list;
         from?: from_clause;
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

export type returning_stmt = { type: 'returning'; columns: column_clause | select_stmt; };

export type insert_value_clause = value_clause | select_stmt_nake;

export type insert_partition = ident_name[] | value_item;

export type conflict_target = { type: 'column'; expr: column_ref_list; parentheses: true; };

export type conflict_action = { keyword: "do"; expr: {type: 'origin'; value: string; }; } | { keyword: "do"; expr: {type: 'update'; set: set_list; where: where_clause; }; };

export type on_conflict = { type: "conflict"; keyword: "on"; target: conflict_target; action: conflict_action; };

export interface replace_insert_stmt_node {
         type: 'insert' | 'replace';
         table?: [table_name];
         columns: column_list;
         conflict?: on_conflict;
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
          expr:  null;
          // nb: Only the last element is a case_else
          args: (case_when_then | case_else)[];
        } | {
          type: 'case';
          expr: expr;
          // nb: Only the last element is a case_else
          args: (case_when_then | case_else)[];
        };

export type case_when_then_list = case_when_then[];

export type case_when_then = { type: 'when'; cond: binary_expr; result: expr; };

export type case_else = { type: 'else'; condition?: never; result: expr; };

export type _expr = logic_operator_expr | or_expr | unary_expr;

export type expr = _expr | union_stmt;

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

export type binary_column_expr = binary_expr;

export type or_and_where_expr = binary_expr | { type: 'expr_list'; value: expr[] };

export type or_expr = binary_expr;

export type and_expr = binary_expr;

export type not_expr = comparison_expr | exists_expr | unary_expr;

export type comparison_expr = binary_expr | literal_string | column_ref;

export type exists_expr = unary_expr;



export type exists_op = 'NOT EXISTS' | KW_EXISTS;

export type comparison_op_right = arithmetic_op_right | in_op_right | between_op_right | is_op_right | like_op_right | jsonb_op_right | regex_op_right;

export type arithmetic_op_right = { type: 'arithmetic'; tail: any };

export type arithmetic_comparison_operator = ">=" | ">" | "<=" | "<>" | "<" | "=" | "!=";

export type is_op_right = { op: 'IS'; right: additive_expr; } | { type: 'origin'; value: string; } | { type: 'IS NOT'; right: additive_expr; };

export type between_op_right = { op: 'BETWEEN' | 'NOT BETWEEN'; right: { type: 'expr_list'; value: [expr, expr] }  };



export type between_or_not_between_op = 'NOT BETWEEN' | KW_BETWEEN;



export type like_op = 'LIKE' | KW_LIKE | KW_ILIKE | 'SIMILAR TO' | 'NOT SIMILAR TO';

export type regex_op = "!~*" | "~*" | "~" | "!~";

export type regex_op_right = { op: regex_op; right: literal | comparison_expr};

export type escape_op = { type: 'ESCAPE'; value: literal_string };



export type in_op = 'NOT IN' | KW_IN;

export type like_op_right = { op: like_op; right: (literal | comparison_expr) & { escape?: escape_op }; };

export type in_op_right = {op: in_op; right: expr_list | var_decl | literal_string; };

export type jsonb_op_right = { op: string; right: expr };

export type additive_expr = binary_expr;

export type additive_operator = "+" | "-";

export type multiplicative_expr = binary_expr;

export type multiplicative_operator = "*" | "/" | "%" | "||";

export type column_ref_array_index = column_ref;

export type primary = cast_expr | or_and_where_expr | var_decl | { type: 'origin'; value: string; };

export type string_constants_escape = { type: 'origin'; value: string; };





export type column_ref = string_constants_escape | {
        type: 'column_ref';
        schema: string;
        table: string;
        column: column | '*';
        arrows?: ('->>' | '->')[];
        property?: (literal_string | literal_numeric)[];
      } | {
        type: 'column_ref';
        table: ident;
        column: column | '*';
        arrows?: ('->>' | '->')[];
        property?: (literal_string | literal_numeric)[];
      };

export type column_list = column[];

export type ident = string;

export type ident_list = ident[];

export type alias_ident = string;

export type quoted_ident = double_quoted_ident | single_quoted_ident | backticks_quoted_ident;



export type double_quoted_ident = string;



export type single_quoted_ident = string;



export type backticks_quoted_ident = string;

export type ident_without_kw = ident_name | quoted_ident;

export type column_without_kw = column_name | quoted_ident;



export type column = string | quoted_ident;



export type column_name = string;

export type ident_name = string;

type ident_start = never;

type ident_part = never;

type column_part = never;

export type param = { type: 'param'; value: ident_name };

export type on_update_current_timestamp = { type: 'on update'; keyword: string; parentheses: boolean; expr: expr } | { type: 'on update'; keyword: string; };

export type over_partition = { type: 'windows'; as_window_specification: as_window_specification } | { partitionby: partition_by_clause; orderby: order_by_clause } | on_update_current_timestamp;

export type aggr_filter = { keyword: 'filter'; parentheses: true, where: where_clause };

export type aggr_func = { type: 'aggr_func'; name: string; args: { expr: additive_expr } | count_arg; over: over_partition; filter?: aggr_filter; };

export type window_func = window_fun_rank | window_fun_laglead | window_fun_firstlast;

export type window_fun_rank = { type: 'window_func'; name: string; over: over_partition };

export type window_fun_laglead = { type: 'window_func'; name: string; args: expr_list; consider_nulls: null | string; over: over_partition };

export type window_fun_firstlast = window_fun_laglead;

type KW_FIRST_LAST_VALUE = never;

type KW_WIN_FNS_RANK = never;

type KW_LAG_LEAD = never;

export type consider_nulls_clause = string;

export type aggr_fun_smma = { type: 'aggr_func'; name: 'SUM' | 'MAX' | 'MIN' | 'AVG'; args: { expr: additive_expr }; over: over_partition };

type KW_SUM_MAX_MIN_AVG = never;

export type aggr_fun_count = { type: 'aggr_func'; name: 'COUNT' | 'GROUP_CONCAT'; args:count_arg; over: over_partition } | { type: 'aggr_func'; name: 'PERCENTILE_CONT' | 'PERCENTILE_DISC'; args: literal_numeric / literal_array; within_group_orderby: order_by_clause; over?: over_partition } | { type: 'aggr_func'; name: 'MODE'; args: literal_numeric / literal_array; within_group_orderby: order_by_clause; over?: over_partition };

export type concat_separator = { keyword: string | null; value: literal_string; };





export type distinct_args = { distinct: 'DISTINCT'; expr: expr; orderby?: order_by_clause; separator?: concat_separator; };



export type count_arg = { expr: star_expr } | distinct_args;

export type aggr_array_agg = { type: 'aggr_func'; args:count_arg; name: 'ARRAY_AGG'; orderby?: order_by_clause  };



export type star_expr = { type: 'star'; value: '*' };

export type trim_position = "BOTH" | "LEADING" | "TRAILING";

export type trim_rem = expr_list;

export type trim_func_clause = { type: 'function'; name: string; args: expr_list; };

export type tablefunc_clause = { type: 'tablefunc'; name: crosstab; args: expr_list; as: func_call };

export type func_call = trim_func_clause | tablefunc_clause | { type: 'function'; name: string; args: expr_list; suffix: literal_string; } | { type: 'function'; name: string; args: expr_list; over?: over_partition; } | extract_func | { type: 'function'; name: string; over?: on_update_current_timestamp; } | { type: 'function'; name: string; args: expr_list; };

export type extract_filed = 'string';

export type extract_func = { type: 'extract'; args: { field: extract_filed; cast_type: 'TIMESTAMP' | 'INTERVAL' | 'TIME'; source: expr; }} | { type: 'extract'; args: { field: extract_filed; source: expr; }};

export type scalar_time_func = KW_CURRENT_DATE | KW_CURRENT_TIME | KW_CURRENT_TIMESTAMP;

export type scalar_func = scalar_time_func | KW_CURRENT_USER | KW_USER | KW_SESSION_USER | KW_SYSTEM_USER | "NTILE";



export type cast_double_colon = {
        as?: alias_clause,
        symbol: '::' | 'as',
        target: data_type;
        arrows?: ('->>' | '->')[];
        property?: (literal_string | literal_numeric)[];
      };





export type cast_expr = {
        type: 'cast';
        expr: or_expr | column_ref | param
          | expr;
        keyword: 'cast';
        ...cast_double_colon;
      } | {
        type: 'cast';
        expr: literal | aggr_func | func_call | case_expr | interval_expr | column_ref | param
          | expr;
        keyword: 'cast';
        ...cast_double_colon;
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

export type literal_datetime = { type: 'TIME' | 'DATE' | 'TIMESTAMP' | 'DATETIME', value: string };

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

type KW_SCHEMA = never;

type KW_SEQUENCE = never;

type KW_TABLESPACE = never;

type KW_COLLATE = never;

type KW_DEALLOCATE = never;

type KW_ON = never;

type KW_LEFT = never;

type KW_RIGHT = never;

type KW_FULL = never;

type KW_INNER = never;

type KW_JOIN = never;

type KW_OUTER = never;

type KW_UNION = never;

type KW_INTERSECT = never;

type KW_EXCEPT = never;

type KW_VALUES = never;

type KW_USING = never;

type KW_WHERE = never;

type KW_WITH = never;

type KW_GROUP = never;

type KW_BY = never;

type KW_ORDER = never;

type KW_HAVING = never;

type KW_WINDOW = never;

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

type KW_GROUP_CONCAT = never;

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

type KW_CHARACTER = never;

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

type KW_SERIAL = never;

type KW_TINYINT = never;

type KW_TINYTEXT = never;

type KW_TEXT = never;

type KW_MEDIUMTEXT = never;

type KW_LONGTEXT = never;

type KW_BIGINT = never;

type KW_ENUM = never;

type KW_FLOAT = never;

type KW_DOUBLE = never;

type KW_BIGSERIAL = never;

type KW_REAL = never;

type KW_DATE = never;

type KW_DATETIME = never;

type KW_ROWS = never;

type KW_TIME = never;

type KW_TIMESTAMP = never;

type KW_TRUNCATE = never;

type KW_USER = never;

type KW_UUID = never;

type KW_OID = never;

type KW_REGCLASS = never;

type KW_REGCOLLATION = never;

type KW_REGCONFIG = never;

type KW_REGDICTIONARY = never;

type KW_REGNAMESPACE = never;

type KW_REGOPER = never;

type KW_REGOPERATOR = never;

type KW_REGPROC = never;

type KW_REGPROCEDURE = never;

type KW_REGROLE = never;

type KW_REGTYPE = never;

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

type KW_CURRENT_ROLE = never;

type KW_SESSION_USER = never;

type KW_SYSTEM_USER = never;

type KW_GLOBAL = never;

type KW_SESSION = never;

type KW_LOCAL = never;

type KW_PERSIST = never;

type KW_PERSIST_ONLY = never;

type KW_VIEW = never;

type KW_VAR__PRE_AT = never;

type KW_VAR__PRE_AT_AT = never;

type KW_VAR_PRE_DOLLAR = never;

type KW_VAR_PRE_DOLLAR_DOUBLE = never;

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

export interface proc_stmt { type: 'proc'; stmt: assign_stmt | return_stmt; vars: any }

export type proc_stmt = AstStatement<proc_stmt>;

export type assign_stmt = { type: 'assign'; left: var_decl | without_prefix_var_decl; symbol: ':=' | '='; right: proc_expr; };

export type return_stmt = { type: 'return'; expr: proc_expr; };

export type proc_expr = select_stmt | proc_join | proc_additive_expr | proc_array;

export type proc_additive_expr = binary_expr;

export type proc_multiplicative_expr = binary_expr;

export type proc_join = { type: 'join'; ltable: var_decl; rtable: var_decl; op: join_op; expr: on_clause; };

export type proc_primary = literal | var_decl | proc_func_call | param | proc_additive_expr & { parentheses: true; } | { type: 'var'; prefix: null; name: number; members: []; quoted: null } | column_ref;

export type proc_func_name = string;

export type proc_func_call = { type: 'function'; name: string; args: null | { type: expr_list; value: proc_primary_list; }};

export type proc_primary_list = proc_primary[];

export type proc_array = { type: 'array'; value: proc_primary_list };

export type var_decl_list = var_decl[];

export type var_decl = { type: 'var'; name: string; prefix: string; suffix: string; }; | without_prefix_var_decl & { type: 'var'; prefix: string; };;

export type without_prefix_var_decl = { type: 'var'; prefix: string; name: ident_name; members: mem_chain; quoted: string | null } | { type: 'var'; prefix: null; name: number; members: []; quoted: null };

export type mem_chain = ident_name[];;

export type data_type = {
                    dataType: string;
                    length?: number;
                    suffix?: string;
                    scale?: number;
                    parentheses?: boolean;
                    expr?: expr_list;
                };





export type array_type = data_type;



export type boolean_type = data_type;



export type binary_type = data_type;

export type character_varying = string;



export type character_string_type = data_type;

export type numeric_type_suffix = any[];;







export type numeric_type = data_type;



export type oid_type = data_type;

export type timezone = string[];;





export type time_type = data_type;





export type datetime_type = data_type | time_type;



export type enum_type = data_type;



export type json_type = data_type;



export type geometry_type = data_type;



export type serial_interval_type = data_type;





export type text_type = data_type;



export type uuid_type = data_type;



export type record_type = data_type;