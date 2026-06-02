// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { exprToSQL } from './expr'
import { toUpper } from './util'

function jsonExprToSQL(expr) {
  const { keyword, expr_list: exprList } = expr
  const result = [toUpper(keyword), exprList.map(exprItem => exprToSQL(exprItem)).join(', ')].join(' ')
  return result
}

export {
  jsonExprToSQL,
}
