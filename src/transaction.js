// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { exprToSQL } from './expr'

function transactionToSQL(stmt) {
  const { expr } = stmt
  return exprToSQL(expr)
}

export {
  transactionToSQL,
}
