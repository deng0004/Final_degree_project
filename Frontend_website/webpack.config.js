const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development', // Set mode to 'development' or 'production'
  entry: './scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [new Dotenv()],
};


