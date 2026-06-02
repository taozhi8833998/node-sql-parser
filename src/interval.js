// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { toUpper, hasVal } from './util'
import { exprToSQL } from './expr'

function intervalToSQL(intervalExpr) {
  const { expr, unit } = intervalExpr
  const result = ['INTERVAL', exprToSQL(expr), toUpper(unit)]
  return result.filter(hasVal).join(' ')
}

export {
  intervalToSQL,
}
