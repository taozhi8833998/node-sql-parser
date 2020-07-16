var req = require.context('./test', true, /\.spec$/);
req.keys().forEach(req);

require('vscode-mocha-hmr')(module);
