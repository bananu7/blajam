module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.js?$/, loader: 'babel', exclude: /(node_modules|bower_components)/ },
            { test: /\.js$/, loader: "eslint-loader", exclude: /(node_modules|bower_components)/}
        ]
    },
    devtool: "source-map",
};