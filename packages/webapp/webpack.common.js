/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

webpack;

module.exports = {
    entry: {
        app: path.join(__dirname, 'src', 'index.tsx'),
    },
    target: 'web',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: '/node_modules/',
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                type: 'asset/inline',
            },
            {
                test: /\.wxml$/i,
                type: 'asset/source',
            },
        ],
    },
    optimization: {
        usedExports: true,
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /node_modules\/.*/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    plugins: [
        new CleanWebpackPlugin({
            dangerouslyAllowCleanPatternsOutsideProject: true,
            dry: false,
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public/*',
                    to: '[name].[ext]',
                    globOptions: {
                        ignore: ['**/index.html'],
                    },
                },
            ],
        }),
    ],
};
