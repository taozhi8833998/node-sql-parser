const req = require.context('./test', true, /\.spec.js$/);
req.keys().forEach(req);

require('vscode-mocha-hmr')(module);
