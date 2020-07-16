const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');


var isCoverage = process.env.NODE_ENV === 'coverage';
const isProd = process.argv.includes('--prod');
const isTest = isCoverage || process.argv.includes('--test');
const outputPath = path.join(__dirname, isProd ? 'output/prod' : isTest ? 'output/test' : 'output/dev');
require('rimraf').sync(outputPath);

function buildConfig(parserName, target, entry, plugins) {
    const watch = !isProd && !isTest && !isCoverage;
    return {
        entry,
        watch,
        target,
        devtool: 'source-map',
        mode: isProd ? 'production' : 'development',
        node: {
            __dirname: false
        },
        externals: target == 'web' ? [] : [
            nodeExternals({
                whitelist: ['webpack/hot/poll?100'],
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: isCoverage
                        ? {
                            loader: 'istanbul-instrumenter-loader',
                            options: { esModules: true },
                        }
                        : {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        },
                    enforce: 'post',
                    // exclude: /node_modules|\.spec\.js$/,
                },
                {
                    test: /\.pegjs$/,
                    loader: 'pegjs-loader'
                }
            ],
        },
        resolve: {
            extensions: ['.js', '.pegjs'],
        },
        plugins: [
            new webpack.DefinePlugin({
                PARSER_NAME: parserName ? JSON.stringify(parserName) : 'null',
            }),
            ...(plugins || []),
            ...(!watch
                ? [
                    new CopyPlugin({
                        patterns: [
                            'LICENSE',
                            'README.md',
                            'package.json',
                            'types.d.ts',
                            { from: 'index.d.ts', to: (parserName || 'index') + (target === 'web' ? '.umd' : '') + '.d.ts', }
                        ],
                    }),
                ] : [
                    new webpack.HotModuleReplacementPlugin(),
                ])],
        output: {
            path: outputPath,
            library: '',
            libraryTarget: target === 'web' ? 'umd' : 'commonjs',
            // this ensures that source maps are mapped to actual files (not "webpack:" uris)
            devtoolModuleFilenameTemplate: info => path.resolve(__dirname, info.resourcePath),
        },
    };
}



// =========== PROD CONFIG ================
if (isProd) {
    const config = module.exports = [];

    for (const target of ['web', 'node']) {
        config.push(
            // full bundle
            buildConfig(null, target, {
                ['index' + (target === 'web' ? '.umd' : '')]: ['./index.js'],
            }),
            // Add one light bundle per language
            ...fs.readdirSync(path.join(__dirname, 'pegjs'))
                .map(x => /^(.+)\.pegjs$/.exec(x))
                .filter(x => !!x)
                .map(x => x[1])
                .map(parser =>
                    buildConfig(parser, target, {
                        [parser + (target === 'web' ? '.umd' : '')]: ['./index.js'],
                    }, [
                        new webpack.NormalModuleReplacementPlugin(
                            /parser\.all/,
                            './parser.single'
                        ),
                        new webpack.NormalModuleReplacementPlugin(
                            /mysql\.pegjs/,
                            '../pegjs/' + parser + '.pegjs'
                        ),
                    ])
                ))
    }
} else {
    // ============= DEV CONFIG (watch) ==============
    module.exports = isTest
        ? buildConfig(null, 'node', {
            'tests': ['./tests-index.js'],
        })
        // test bundle (HMR)
        : buildConfig(null, 'node', {
            'tests': ['./tests-index.js'],
        });
}