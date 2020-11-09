const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const { templateTransformer } = require('@halleymedia/unobtrusive-vue');
const development = 'development';

/**
 * @param {any} env
 * @param {any} argv
 */
module.exports = (env, argv) => {
  const mode = argv.mode || development;
  const isDev = mode === development;

  return {
    mode,
    devtool: isDev ? 'source-map' : false,
    devServer: isDev ? {
      hot: true,
      contentBase: path.resolve(__dirname, '../dist'),
      compress: false,
      port: 3000
    } : undefined,
    entry: {
      index: path.resolve(__dirname, './index.js')
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
    },
    plugins: [
      new CopyPlugin({
        patterns: [{
          from: path.resolve(__dirname, './index.html'),
          to: path.resolve(__dirname, '../dist/index.html'),
          toType: 'file'
        }]
      })
    ],
    resolve: {
      extensions: ['.mjs', '.js', '.d.ts']
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader',
          options: {
            attributes: {
              root: path.resolve(__dirname, '.')
            },
            minimize: {
              removeAttributeQuotes: false
            },
            preprocessor: /** @param {string} content */ (content) => templateTransformer.transform(content)
          }
        },
        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                generator: /** @param {string} content */ (content) => svgToMiniDataURI(content.toString())
              }
            }
          ]
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader'
          ]
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: /(node_modules|lib)/,
          use: [{
            loader: 'standard-loader',
            options: {
              parser: 'babel-eslint',
              standard: 'semistandard'
            }
          },
          {
            loader: 'webpack-preprocessor-loader',
            options: {
              params: { MODE: mode }
            }
          }
          ]
        },
        {
          // Add support for hot reload for each module
          enforce: 'pre',
          test: /\.js$/,
          include: /components/,
          exclude: /node_modules/,
          use: {
            loader: path.join(__dirname, 'webpack.hot-loader.js')
          }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: require('../babel.config.js')
            }

          ]
        }
      ]
    }
  };
};
