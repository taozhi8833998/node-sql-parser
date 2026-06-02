// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assignToSQL } from './assign'
import { exprToSQL } from './expr'
import { toUpper } from './util'

function returnToSQL(stmt) {
  const { type, expr } = stmt
  return [toUpper(type), exprToSQL(expr)].join(' ')
}

function procToSQL(expr) {
  const { stmt } = expr
  switch (stmt.type) {
    case 'assign':
      return assignToSQL(stmt)
    case 'return':
      return returnToSQL(stmt)
  }
}

export {
  procToSQL,
  returnToSQL,
}
