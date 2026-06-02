// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const req = require.context('./test', true, /\.spec.js$/);
req.keys().forEach(req);

require('vscode-mocha-hmr')(module);
