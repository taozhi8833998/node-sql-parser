const CopyPlugin = require('copy-webpack-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const isCoverage = process.env.NODE_ENV === 'coverage'
const isProd = process.argv.includes('production')
const isTest = isCoverage || process.argv.includes('test')
const subDir = isProd ? 'output/prod' : isTest ? 'output/test' : 'output/dev'
const outputPath = path.join(__dirname, subDir)
const srcPath = path.join(__dirname, 'src')
require('rimraf').sync(outputPath)

if (isProd) require('./typegen')

const moduleCfg = {
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
        },
        {
            test: /\.pegjs$/,
            loader: 'pegjs-loader?dependencies={"BigInt":"big-integer"}'
        }
    ],
}

const getCopyFile = (database) => {
    return [
        { source: `${outputPath}/${database}.js`, destination: `${outputPath}/build/${database}.js` },
        { source: `${outputPath}/${database}.js.map`, destination: `${outputPath}/build/${database}.js.map` },
        { source: `${outputPath}/${database}.d.ts`, destination: `${outputPath}/build/${database}.d.ts` },
    ]
}

const getSrcFile = () => fs.readdirSync(srcPath).filter(name => name !== 'parser.all.js' || name !== 'parser.single.js').map(name => ({ source: `${outputPath}/${name}`, destination: `${outputPath}/lib/${name}` }))

const getPlugins = (parserName, target, plugins = []) => {
  const pluginList = [new webpack.DefinePlugin({ PARSER_NAME: parserName ? JSON.stringify(parserName) : 'null' }), ...plugins]
  if (isProd) {
    const tsFileName = (parserName || 'index') + (target === 'web' ? '.umd' : '') + '.d.ts'
    pluginList.push(
      new CopyPlugin({
        patterns: [
          'LICENSE',
          'lib',
          'README.md',
          'package.json',
          'types.d.ts',
          'ast/**',
          {
            from: 'index.d.ts',
            to: tsFileName,
          }
        ],
      }),
    )
    const fileConfig = {
      events: { onEnd: {} },
      runTasksInSeries: true,
    }
    if (parserName === null) {
      if (target === 'web') {
        fileConfig.events.onEnd.mkdir = [
          `${outputPath}/umd`,
          `${outputPath}/build`,
          `${outputPath}/lib`,
        ]
        fileConfig.events.onEnd.move = [
          { source: `${outputPath}/index.umd.js`, destination: `${outputPath}/umd/index.umd.js` },
          { source: `${outputPath}/index.umd.d.ts`, destination: `${outputPath}/umd/index.umd.d.ts` },
          { source: `${outputPath}/index.umd.js.map`, destination: `${outputPath}/umd/index.umd.js.map` },
        ]
      }
      if (target === 'node') fileConfig.events.onEnd.move = getSrcFile()
    } else {
      if (target === 'node') fileConfig.events.onEnd.move = getCopyFile(parserName)
      if (target === 'web') fileConfig.events.onEnd.move = [
        { source: `${outputPath}/${parserName}.umd.d.ts`, destination: `${outputPath}/umd/${parserName}.umd.d.ts` },
        { source: `${outputPath}/${parserName}.umd.js`, destination: `${outputPath}/umd/${parserName}.umd.js` },
        { source: `${outputPath}/${parserName}.umd.js.map`, destination: `${outputPath}/umd/${parserName}.umd.js.map` },
      ]
    }
    pluginList.push(new FileManagerPlugin(fileConfig))
  }
  return pluginList
}
const getOutput = (target) => {
  const output = {
    path: outputPath,
    library: '',
    libraryTarget: target === 'web' ? 'umd' : 'commonjs',
    // this ensures that source maps are mapped to actual files (not "webpack:" uris)
    devtoolModuleFilenameTemplate: info => path.resolve(__dirname, info.resourcePath),
  }
  if (target === 'web') output.globalObject = 'this'
  return output
}

function buildConfig(parserName, target, entry, plugins) {
    const watch = !(isProd || isTest || isCoverage)
    return {
        devtool: 'source-map',
        externals: target == 'web' ? [] : [
            nodeExternals({
                allowlist: ['webpack/hot/poll?100'],
            }),
        ],
        entry,
        watch,
        target,
        mode: isProd ? 'production' : 'development',
        node: { __dirname: false },
        module: moduleCfg,
        resolve: { extensions: ['.js', '.pegjs'] },
        plugins: getPlugins(parserName, target, plugins),
        output: getOutput(target),
    }
}

// =========== PROD CONFIG ================
if (isProd) {
    const config = module.exports = []

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
                'tests': ['webpack/hot/poll?100', './tests-index.js'],
            }, [new webpack.HotModuleReplacementPlugin()])
}
