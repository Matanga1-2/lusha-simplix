const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require("dotenv-webpack");
require("dotenv").config();

const path = require("path");
const outputPath = "dist";
const entryPoints = {
  main: [
    path.resolve(__dirname, "src", "main.ts"),
    path.resolve(__dirname, "scss", "main.scss"),
  ],
  content: [
    path.resolve(__dirname, "src", "content.ts"),
    path.resolve(__dirname, "scss", "content.scss"),
  ],
  actions: path.resolve(__dirname, "src", "actions.ts"),
  background: path.resolve(__dirname, "src", "background.ts"),
};

module.exports = {
  entry: entryPoints,
  output: {
    path: path.join(__dirname, outputPath),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve("buffer/"),
      stream: require.resolve("stream-browserify"),
      vm: require.resolve("vm-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/i,
        use: "url-loader?limit=1024",
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: ".", context: "public" }],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new Dotenv(),
  ],
};
