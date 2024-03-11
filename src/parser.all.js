import { parse as athena } from './generated/athena'
import { parse as bigquery } from './generated/bigquery'
import { parse as db2 } from './generated/db2'
import { parse as flinksql } from './generated/flinksql'
import { parse as hive } from './generated/hive'
import { parse as mysql } from './generated/mysql'
import { parse as mariadb } from './generated/mariadb'
import { parse as noql } from './generated/noql'
import { parse as postgresql } from './generated/postgresql'
import { parse as redshift } from './generated/redshift'
import { parse as sqlite } from './generated/sqlite'
import { parse as transactsql } from './generated/transactsql'
import { parse as snowflake } from './generated/snowflake'

export default {
  athena,
  bigquery,
  db2,
  flinksql,
  hive,
  mysql,
  mariadb,
  noql,
  postgresql,
  redshift,
  snowflake,
  sqlite,
  transactsql,
}
