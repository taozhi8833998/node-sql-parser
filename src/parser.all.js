import { parse as bigquery } from '../pegjs/bigquery.pegjs'
import { parse as db2 } from '../pegjs/db2.pegjs'
import { parse as hive } from '../pegjs/hive.pegjs'
import { parse as mysql } from '../pegjs/mysql.pegjs'
import { parse as mariadb } from '../pegjs/mariadb.pegjs'
import { parse as postgresql } from '../pegjs/postgresql.pegjs'
import { parse as sqlite } from '../pegjs/sqlite.pegjs'
import { parse as transactsql } from '../pegjs/transactsql.pegjs'
import { parse as flinksql } from '../pegjs/flinksql.pegjs'

export default {
  bigquery,
  db2,
  hive,
  mysql,
  mariadb,
  postgresql,
  sqlite,
  transactsql,
  flinksql,
}
