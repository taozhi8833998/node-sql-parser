// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parse } from '../pegjs/mysql.pegjs'

export default {
  [PARSER_NAME] : parse,
}
