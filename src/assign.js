// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { exprToSQL } from './expr'

function assignToSQL(expr) {
  /** @type {Object} */
  const { left, right, symbol, keyword } = expr
  left.keyword = keyword
  const leftVar = exprToSQL(left)
  const rightVal = exprToSQL(right)
  return `${leftVar} ${symbol} ${rightVal}`
}

export {
  assignToSQL,
}
