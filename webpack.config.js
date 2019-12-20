const config = {};
module.exports = config;

config.mode = 'none';

config.entry = "./src/react-bem-mod.js";

config.output = {};

config.output.path = require('path').resolve(__dirname, './dist');
config.output.filename = 'react-bem-mod.js';
config.output.library = "reactBemMode";   // Important
config.output.libraryTarget = 'umd';   // Important
config.output.umdNamedDefine = true;  // Important

config.module = {rules: []};
config.module.rules.push(
  {
    test: /\.m?js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: "babel-loader"
    }
  }
);

config.externals = {
  react: 'react'
};